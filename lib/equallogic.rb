require 'pty'
require 'my_expect'

class Equallogic

  def initialize(logger = nil)
    @logger = logger || Rails.logger
    @prompt = /^#{Settings.storage.server}> /
  end

  def connect
    s = Settings.storage
    ssh_cmd = "ssh -l #{s.account} #{s.server}"
    PTY.spawn(ssh_cmd) {|r, w, pid|
      begin
        w.sync = true

        def w.cmd(str)
          self.print str
          self.print "\r"
        end

        r.expect(/password: /, 20) {|m|
          w.cmd s.password
        }
        r.expect(@prompt, 20) {|m|
          w.cmd 'stty hardwrap off'
        }

        yield r, w

        r.expect(@prompt, 20) {|m|
          w.cmd "logout"
        }
        if s.confirm_on_logout
          r.expect(/^Do you really want to logout\? \(y\/n\) \[n\]/, 20) {|m|
            w.cmd "y"
          }
        end
      ensure
        Process.kill(:KILL, pid)
      end
    }
  end

  def clone_volume(server)
    src_volume = server.image.iqn.split(':')[1].split('-', 5)[4]
    dst_volume = server.name
    dst_iqn = nil

    connect {|r, w|
      r.expect(@prompt, 20) {|m|
        w.cmd "volume select #{src_volume} clone #{dst_volume} snap-reserve 0%"
      }
      r.expect(/^iSCSI target name is (.*)[\r\n]/, 20) {|m|
        dst_iqn = m[1]
      }
      r.expect(@prompt, 20) {|m|
        w.cmd "volume select #{dst_volume} pool #{server.pool}"
      }
      r.expect(@prompt, 20) {|m|
        w.cmd "volume select #{dst_volume} multihost-access enable"
      }
      r.expect(@prompt, 20) {|m|
        w.cmd "volume select #{dst_volume} access create" +
              " authmethod chap" +
              " username #{Settings.storage.chap_user}" +
              " ipaddress #{Settings.storage.allow_ipaddress}"
      }
    }

    @logger.info "added volume #{server.name}"

    dst_iqn
  end

  def delete_volume(server)
    volume = server.name

    connect {|r, w|
      r.expect(@prompt, 20) {|m|
        w.cmd "volume select #{volume} offline"
      }
      r.expect(@prompt, 20) {|m|
        w.cmd "volume delete #{volume}"
      }
      r.expect(/^Do you really want to delete the volume and destroy \S+ of data\? \(y\/n\) \[n\]/, 20) {|m|
        w.cmd "y"
      }
    }

    @logger.info "deleted volume #{server.name}"
  end

  def get_pool(name)
    pool = nil

    connect {|r, w|
      r.expect(@prompt, 20) {|m|
        w.cmd "volume select #{name} show"
      }

      until pool
        r.expect(/Pool: (.*)[\r\n]|Press any key to continue \(Q to quit\)/, 20) {|m|
          if m[1]
            pool = m[1]
          else
            w.print ' '
          end
        }
      end

      r.expect(/Press any key to continue \(Q to quit\)/, 20) {|m|
        w.print 'Q'
        w.cmd ''
      }
    }

    pool
  end

end
