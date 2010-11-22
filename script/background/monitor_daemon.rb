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
    conn_pool = Hash.new
        
    loop do
      begin
        servers = Server.all
        servers.each do |server|
          if conn_pool.has_key?(server.physical_server)
            conn = conn_pool[server.physical_server]
          else
            @logger.debug "connect #{server.physical_server}"
            conn = Libvirt::open_read_only("qemu+ssh://root@#{server.physical_server}/system")
            conn_pool[server.physical_server] = conn
          end

          begin
            domain = conn.lookup_domain_by_name(server.name)
          rescue Libvirt::RetrieveError
            next
          end

          set_monitor(server, domain)
          set_status(server, domain)
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

  def self.set_monitor(server, domain)
    if @monitoring.has_key?(server.id)
      monitors = @memcache.get("#{Settings.memcached.key.monitor}:#{server.id}") || Array.new
    else
      @memcache.set("#{Settings.memcached.key.cpus}:#{server.id}", server.cpus)
      @monitoring[server.id] = true
      monitors = Array.new
    end

    time = Time.now
    monitors << { :time => time.to_i, :usec => time.usec, :cpu_time => domain.info.cpu_time }

    monitors.shift if monitors.size > Settings.monitor_caches
    @memcache.set("#{Settings.memcached.key.monitor}:#{server.id}", monitors)
  end

  STATES = {
    Libvirt::Domain::RUNNING => 'Running',
    Libvirt::Domain::PAUSED => 'Paused',
    Libvirt::Domain::SHUTOFF => 'Terminated'
  }

  def self.set_status(server, domain)
    state = domain.info.state
    @memcache.set("#{Settings.memcached.key.state}:#{server.id}", STATES[state])

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
  end
  
  def self.stop
    @logger.info "Stopping daemon #{self.name}"
  end
end

MonitorDaemon.daemonize
