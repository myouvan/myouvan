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
class ServerDaemon < SimpleDaemon::Base
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
    starling = Starling.new(Settings.starling.server)
        
    loop do 
      begin
        begin
          item = starling.get(Settings.starling.queue)
        rescue MemCache::MemCacheError => v
          @logger.debug v.message
          raise unless ['No servers available (all dead)', 'Broken pipe'].include?(v.message)
        end

        if item
          pid = Process.fork {
            server = Server.find(item[:server_id])
            begin
              @logger.debug item.inspect
              ps = PhysicalServer.new(@logger)

              case item[:command]
              when 'create_server'
                ps.create_server(server, item[:domain_xml])
              when 'update_server'
                ps.update_server(server, item[:cpus_or_memory_changed], item[:ip_address_changed])
              when 'suspend_server'
                ps.suspend_server(server)
              when 'resume_server'
                ps.resume_server(server)
              when 'reboot_server'
                ps.reboot_server(server)
              when 'shutdown_server'
                ps.shutdown_server(server)
              when 'restart_server'
                ps.restart_server(server)
              when 'migrate_server'
                ps.migrate_server(server, item[:new_physical_server])
              when 'terminate_server'
                ps.terminate_server(server)
              when 'failover_server'
                ps.failover_server(server, item[:domain_xml])
              end
            rescue Exception => e
              server.status = 'Error'
              server.save
              raise
            end
          }

          Process.detach(pid)
        end
        
        # Optional. Sleep between tasks.
        Kernel.sleep 1
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
  
  def self.stop
    @logger.info "Stopping daemon #{self.name}"
  end
end

ServerDaemon.daemonize
