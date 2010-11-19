require 'pty'
require 'my_expect'

class Centos

  def initialize(logger)
    @logger = logger
  end

  def config_server(server)
    @prompt = /.*\[root@vmiw-tmp01 ~\]# /
    ssh_cmd = "ssh -t -l root #{server.physical_server} virsh console #{server.name}"

    PTY.spawn(ssh_cmd) {|r, w, pid|
      begin
        r.set_encoding('ASCII-8BIT')
        w.sync = true

        def w.cmd(str)
          self.print str
          self.print "\r"
        end

        @logger.debug "starting up server #{server.name}"

        r.expect(/login: /, 300) {|m|
          w.cmd Settings.virtual_server.centos.account
        }
        r.expect(/Password: /, 20) {|m|
          w.cmd Settings.virtual_server.centos.password
        }

        @logger.debug "logged in to server #{server.name}"

        config_hostname(server, r, w)
        config_network(server, r, w)

        @logger.debug "modified files on server #{server.name}"

        r.expect(@prompt, 20) {|m|
          w.cmd '/sbin/shutdown -r now'
        }

        @logger.debug "rebooting server #{server.name}"

        r.expect(/login: /, 300) {|m|
          w.print "\C-]"
        }

        @logger.debug "finished config server #{server.name}"
      ensure
        Process.kill(:KILL, pid)
      end
    }
  end

  def config_hostname(server, r, w)
    r.expect(@prompt, 20) {|m|
      w.cmd 'sed -i -f - /etc/hosts'
    }
    r.expect(/\r\n/, 20) {|m|
      w.cmd "s/^\\(127\\.0\\.0\\.1[[:space:]]\\+\\).*$/\\1#{server.name} localhost.localdomain localhost/"
      w.print "\C-d"
    }
    r.expect(@prompt, 20) {|m|
      w.cmd 'sed -i -f - /etc/sysconfig/network'
    }
    r.expect(/\r\n/, 20) {|m|
      w.cmd "s/^\\(HOSTNAME=\\).*$/\\1#{server.name}/"
      w.print "\C-d"
    }
  end

  def config_network(server, r, w)
    server.interfaces.each do |interface|
      r.expect(@prompt, 20) {|m|
        w.cmd "sed -i -f - /etc/sysconfig/network-scripts/ifcfg-eth#{interface.number}"
      }
      r.expect(/\r\n/, 20) {|m|
        w.cmd "s/^\\(HWADDR=\\).*$/\\1#{interface.mac_address}/"
        w.cmd "s/^\\(IPADDR=\\).*$/\\1#{interface.ip_address}/"
        w.cmd "s/^\\(ONBOOT=\\).*$/\\1yes/"
        w.print "\C-d"
      }
    end
  end

end
