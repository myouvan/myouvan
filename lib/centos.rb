require 'pty'
require 'my_expect'

class Centos

  def initialize(logger = nil)
    @logger = logger || Rails.logger
  end

  #==============================
  #   common
  #==============================

  def connect(name, physical_server, &block)
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

        block.call(r, w)

        print "\C-]"
      ensure
        Process.kill(:KILL, pid)
      end
    }
  end

  def connect_immediate_login(name, physical_server, &block)
    connect(name, physical_server) {|r, w|
      r.expect(/Escape character is \^\]/, 20) {|m|
        w.cmd ''
      }
      r.expect(/login: /, 20) {|m|
        w.cmd Settings.virtual_server.centos.account
      }

      login(r, w, &block)
    }
  end

  def connect_wait(name, physical_server, &block)
    connect(name, physical_server) {|r, w|
      r.expect(/login: /, 300)

      block.call(r, w) if block
    }
  end

  def connect_wait_login(name, physical_server, &block)
    connect_wait(name, physical_server) {|r, w|
      w.cmd Settings.virtual_server.centos.account

      login(r, w, &block)
    }
  end

  def login(r, w, &block)
    r.expect(/Password: /, 20) {|m|
      w.cmd Settings.virtual_server.centos.password
    }

    block.call(r, w)

    r.expect(@prompt, 20) {|m|
      w.cmd 'exit'
    }
    r.expect(/login: /, 20)
  end

  #==============================
  #   common
  #==============================

  def wait_login_prompt(server)
    connect_wait(server.name, server.physical_server)
  end

  def set_network(server)
    connect_wait_login(server.name, server.physical_server) {|r, w|
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
    }
  end

  def set_ip_addresses(server)
    connect_immediate_login(server.name, server.physical_server) {|r, w|
      server.interfaces.each do |interface|
        r.expect(@prompt, 20) {|m|
          w.cmd "sed -i -f - /etc/sysconfig/network-scripts/ifcfg-eth#{interface.number}"
        }
        r.expect(/\r?\n/, 20) {|m|
          w.cmd "s/^\\(IPADDR=\\).*$/\\1#{interface.ip_address}/"
          w.print "\C-d"
        }
      end

      r.expect(@prompt, 20) {|m|
        w.cmd 'service network restart'
      }
    }
  end

  def get_ip_addresses(name, physical_server)
    ip_address0, ip_address1 = nil, nil

    connect_immediate_login(name, physical_server) {|r, w|
      r.expect(@prompt, 20) {|m|
        w.cmd 'cat /etc/sysconfig/network-scripts/ifcfg-eth0'
      }
      r.expect(/IPADDR=(.*?)\r?\n/, 20) {|m|
        ip_address0 = m[1]
      }

      r.expect(@prompt, 20) {|m|
        w.cmd 'cat /etc/sysconfig/network-scripts/ifcfg-eth1'
      }
      r.expect(/IPADDR=(.*?)\r?\n/, 20) {|m|
        ip_address1 = m[1]
      }
    }

    [ip_address0, ip_address1]
  end

end
