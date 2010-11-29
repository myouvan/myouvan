require 'pty'
require 'my_expect'

class Centos

  def initialize(logger = nil)
    @logger = logger || Rails.logger
  end

  def connect(name, physical_server)
    @prompt = /.*\[root@.* ~\]# /
    ssh_cmd = "ssh -t -l root #{physical_server} virsh console #{name}"

    PTY.spawn(ssh_cmd) {|r, w, pid|
      begin
        r.set_encoding('ASCII-8BIT')
        w.sync = true

        def w.cmd(str)
          self.print str
          self.print "\r"
        end

        @logger.debug "connected server #{name} on #{physical_server} through console"

        yield r, w
      ensure
        Process.kill(:KILL, pid)
      end
    }
  end

  def config_server(server)
    connect(server.name, server.physical_server) {|r, w|
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
    r.expect(/\r?\n/, 20) {|m|
      w.cmd "s/^\\(HOSTNAME=\\).*$/\\1#{server.name}/"
      w.print "\C-d"
    }
  end

  def config_network(server, r, w)
    server.interfaces.each do |interface|
      r.expect(@prompt, 20) {|m|
        w.cmd "sed -i -f - /etc/sysconfig/network-scripts/ifcfg-eth#{interface.number}"
      }
      r.expect(/\r?\n/, 20) {|m|
        w.cmd "s/^\\(HWADDR=\\).*$/\\1#{interface.mac_address}/"
        w.cmd "s/^\\(IPADDR=\\).*$/\\1#{interface.ip_address}/"
        w.cmd "s/^\\(ONBOOT=\\).*$/\\1yes/"
        w.print "\C-d"
      }
    end
  end

  def wait_for_started(server)
    connect(server.name, server.physical_server) {|r, w|
      r.expect(/login: /, 300) {|m|
      }
    }
  end

  def get_ip_addresses(name, physical_server)
    ip_address0, ip_address1 = nil, nil

    connect(name, physical_server) {|r, w|
      r.expect(/Escape character is \^\]/, 20) {|m|
        w.cmd ''
      }

      r.expect(/login: /, 20) {|m|
        w.cmd Settings.virtual_server.centos.account
      }
      r.expect(/Password: /, 20) {|m|
        w.cmd Settings.virtual_server.centos.password
      }

      r.expect(@prompt, 20) {|m|
        w.cmd 'cat /etc/sysconfig/network-scripts/ifcfg-eth0'
      }
      r.expect(/IPADDR=(.*)\r?\n/, 20) {|m|
        ip_address0 = m[1]
      }

      r.expect(@prompt, 20) {|m|
        w.cmd 'cat /etc/sysconfig/network-scripts/ifcfg-eth1'
      }
      r.expect(/IPADDR=(.*)\r?\n/, 20) {|m|
        ip_address1 = m[1]
      }

      r.expect(@prompt, 20) {|m|
        w.cmd 'exit'
      }
      r.expect(/login: /, 20) {|m|
      }
    }

    [ip_address0, ip_address1]
  end

end
