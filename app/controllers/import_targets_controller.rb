require 'rexml/rexml'
require 'rexml/document'

class ImportTargetsController < ApplicationController

  def index
    @server_names = Server.all.collect {|server| server.name }

    @import_targets = Hash.new
    threads = Array.new

    Settings.physical_server.each do |ps|
      ps['physical_servers'].each do |physical_server|
        threads << Thread.new {
          get_import_target(ps['zone'], physical_server)
        }
      end
    end
    threads.each &:join

    import_targets = @import_targets.keys.sort.collect {|physical_server|
      @import_targets[physical_server]
    }.flatten

    render_json :items, import_targets
  end

  def get_import_target(zone, physical_server)
    begin
      conn = Libvirt.open("qemu+ssh://root@#{physical_server}/system")
    rescue Libvirt::ConnectionError
      return
    end

    begin
      domains = conn.list_domains.collect {|domain_id|
        conn.lookup_domain_by_id(domain_id)
      }.select {|domain|
        not @server_names.include?(domain.name) and
        domain.info.state == Libvirt::Domain::RUNNING
      }.sort_by &:name

      import_targets = Array.new
      domains.each do |domain|
        import_target = {
          :zone => zone,
          :physical_server => physical_server,
        }
        import_target.merge! parse_xml_desc(domain.xml_desc)
        import_target.merge! :paths => {
          :import_target => import_target_path(import_target[:name])
        }
        import_targets << import_target
      end
      @import_targets[physical_server] = import_targets
    ensure
      conn.close
    end
  end

  def parse_xml_desc(xml)
    doc = REXML::Document.new(xml)

    type = REXML::XPath.first(doc, '/domain/@type').value
    if type == 'kvm'
      virtualization = 'KVM FullVirtualization'
    end

    name = REXML::XPath.first(doc, '/domain/name/text()')
    uuid = REXML::XPath.first(doc, '/domain/uuid/text()')
    cpus = REXML::XPath.first(doc, '/domain/vcpu/text()')
    memory = REXML::XPath.first(doc, '/domain/memory/text()')

    device = REXML::XPath.first(doc, '/domain/devices/disk/source/@dev').value
    storage_iqn = /\/dev\/disk\/by-path\/.*-iscsi-(.*)-lun-0/.match(device)[1]

    mac_address0 = REXML::XPath.first(doc, '/domain/devices/interface[source/@bridge="br0"]/mac/@address').value
    mac_address1 = REXML::XPath.first(doc, '/domain/devices/interface[source/@bridge="br1"]/mac/@address').value

    {
      :name => name.to_s,
      :uuid => uuid.to_s,
      :virtualization => virtualization,
      :cpus => cpus.to_s.to_i,
      :memory => memory.to_s.to_i / 1024,
      :storage_iqn => storage_iqn.to_s,
      :mac_address0 => mac_address0.to_s,
      :mac_address1 => mac_address1.to_s
    }
  end

  def show
    name = params[:id]
    physical_server = params[:physical_server]

    el = Equallogic.new
    pool = el.get_pool(params[:id])

    centos = Centos.new
    ip_address0, ip_address1 = centos.get_ip_addresses(name, physical_server)

    render :json => {
      :success => true,
      :item => {
        :pool => pool,
        :ip_address0 => ip_address0,
        :ip_address1 => ip_address1
      }
    }
  end

end
