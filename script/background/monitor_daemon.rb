#!/usr/bin/env ruby

# Load Rails.
ENV['RAILS_ENV'] = ARGV[1] if ARGV[1]
require File.dirname(__FILE__) + '/../../config/environment.rb'

# TODO: More ARGV-based setup here.


# Restore timestamps in the log.
class Logger
  def format_message(severity, timestamp, progname, msg)
    "#{severity[0,1]} [#{timestamp} PID:#{$$}] #{progname}: #{msg}\n"
  end
end


require 'simple-daemon'
require 'libvirt'
class MonitorDaemon < SimpleDaemon::Base
  SimpleDaemon::WORKING_DIRECTORY = Rails.root.join 'log'

  class Connector

    def initialize(physical_server, logger)
      @physical_server, @logger = physical_server, logger
    end

    def connect
      unless @conn
        return false if @time_check_down and Time.now.to_f - @time_check_down < 30
        @logger.debug "connecting #{@physical_server}"
        begin 
          @conn = Libvirt::open_read_only("qemu+ssh://root@#{@physical_server}/system")
          @time_check_down = nil
        rescue Libvirt::ConnectionError => err
          @logger.info "#{err.class}: #{err.message}"
          @time_check_down = Time.now.to_f
          return false
        end
      end
      true
    end

    def reset_conn
      @conn = nil
    end

    attr_reader :conn

  end
  
  def self.start
    STDOUT.sync = true
    @logger = Logger.new(STDOUT)
    @logger.level = Rails.env.production? ? Logger::INFO : Logger::DEBUG
    if Rails.env.development?
      # Disable SQL logging in debugging.
      # This is handy if your daemon queries the database often.
      ActiveRecord::Base.logger.level = Logger::INFO
    end
		
    @logger.info "Starting daemon #{self.name}"
    @starling = Starling.new(Settings.starling.server)
    @memcache = MemCache.new(Settings.memcached.server)
    @monitoring = Hash.new

    @connectors = Hash.new {|hash, key|
      hash[key] = Connector.new(key, @logger)
    }
        
    loop do
      begin
        servers = Server.all
        servers.each do |server|
          domain_info = get_domain_info(server)
          next unless domain_info

          set_monitor(server, domain_info)
          set_status(server, domain_info)
        end
        
        # Optional. Sleep between tasks.
        Kernel.sleep 2
      rescue Exception => e
        # This gets thrown when we need to get out.
        raise if e.kind_of? SystemExit
				
        @logger.error "Error in daemon #{self.name} - #{e.class.name}: #{e}"
        @logger.info e.backtrace.join("\n")
        
        # If something bad happened, it usually makes sense to wait for some
        # time, so any external issues can settle.
        Kernel.sleep 5
      end
    end
  end

  def self.get_domain_info(server)
    connector = @connectors[server.physical_server]

    begin
      unless connector.connect
        server.status = 'Unknown'
        server.message = 'physical server may be down'
        server.save
        return nil
      end

      domain = connector.conn.lookup_domain_by_name(server.name)
      domain_info = domain.info

      return domain_info
    rescue Libvirt::RetrieveError => err
      @logger.info "#{err.class}: #{err.message}"
      case err.message
      when /Domain not found/
        unless %w(Creating Terminated Migrating Error).include?(server.status)
          server.status = 'Unknown'
          server.message = 'domain may be disappeared'
          server.save
        end
        return nil
      when /Broken pipe/
        connector.reset_conn
        retry
      end
      return nil
    end
  end

  def self.set_monitor(server, domain_info)
    if @monitoring.has_key?(server.id)
      monitors = @memcache.get("#{Settings.memcached.key.monitor}:#{server.id}") || Array.new
    else
      @memcache.set("#{Settings.memcached.key.cpus}:#{server.id}", server.cpus)
      @monitoring[server.id] = true
      monitors = Array.new
    end

    time = Time.now
    monitors << { :time => time.to_i, :usec => time.usec, :cpu_time => domain_info.cpu_time }

    monitors.shift if monitors.size > Settings.monitor_caches
    @memcache.set("#{Settings.memcached.key.monitor}:#{server.id}", monitors)
  end

  STATES = {
    Libvirt::Domain::RUNNING => 'Running',
    Libvirt::Domain::PAUSED => 'Paused',
    Libvirt::Domain::SHUTOFF => 'Shut down'
  }

  def self.set_status(server, domain_info)
    state = domain_info.state

    if state == Libvirt::Domain::SHUTOFF and
        server.status == 'Running' and
        server.auto_restart and
        not server.user_terminate
      server.status = 'Restarting'
      server.save

      item = {
        :command => 'restart_server',
        :server_id => server.id
      }

      @starling.set(Settings.starling.queue, item)
    end

    if %w(Running Paused Shut\ down).include?(server.status) and server.status != STATES[state]
      server.status = STATES[state]
      server.save
    elsif server.status == 'Unknown'
      server.status = STATES[state]
      server.message = nil
      server.save
    end
  end
  
  def self.stop
    @logger.info "Stopping daemon #{self.name}"
  end
end

MonitorDaemon.daemonize
