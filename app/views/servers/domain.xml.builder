xml.instruct!

xml.domain :type => 'kvm' do
  xml.name @server.name
  xml.uuid @server.uuid
  xml.memory @server.memory * 1024
  xml.currentMemory @server.memory * 1024
  xml.vcpu @server.cpus
  xml.os do
    xml.type 'hvm', :arch => 'x86_64', :machine => 'rhel5.4.0'
    xml.boot :dev => 'hd'
  end
  xml.features do
    xml.acpi
    xml.apic
    xml.pae
  end
  xml.clock :offset => 'utc'
  xml.on_poweroff 'destroy'
  xml.on_reboot 'restart'
  xml.on_crash 'restart'
  xml.devices do
    xml.emulator '/usr/libexec/qemu-kvm'
    xml.disk :type => 'block', :device => 'disk' do
      xml.driver :name => 'qemu', :cache => 'none'
      xml.source :dev => '%%device%%'
      xml.target :dev => 'vda', :bus => 'virtio'
    end
    @server.interfaces.each do |interface|
      xml.interface :type => 'bridge' do
        xml.mac :address => interface.mac_address
        xml.source :bridge => "br#{interface.number}"
        xml.model :type => 'virtio'
      end
    end
    xml.serial :type => 'pty' do
      xml.target :port => '0'
    end
    xml.console :type => 'pty' do
      xml.target :port => '0'
    end
  end
end
