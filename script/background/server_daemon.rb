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
        
    loop do 
      begin
        # TODO: execute some tasks in the background repeatedly
        
        # YOUR CODE HERE
        
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
