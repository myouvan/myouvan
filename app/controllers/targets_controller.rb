require 'rexml/rexml'
require 'rexml/document'

class TargetsController < ApplicationController

  def index
    targets = Array.new
    Settings.physical_server.each do |ps|
      ps['physical_servers'].each do |physical_server|
        conn = Libvirt.open("qemu+ssh://root@#{physical_server}/system")
        begin
          domains = conn.list_domains.collect {|domain_id|
            conn.lookup_domain_by_id(domain_id)
          }.sort_by {|domain|
            domain.name
          }

          domains.each do |domain|
            target = {
              :zone => ps['zone'],
              :physical_server => physical_server,
            }
            target.merge!(parse_xml_desc(domain.xml_desc))
            targets << target
          end
        ensure
          conn.close
        end
      end
    end

    render :json => { :success => true, :items => targets }
  end

  def parse_xml_desc(xml)
    doc = REXML::Document.new(xml)

    name = REXML::XPath.first(doc, '/domain/name/text()')
    uuid = REXML::XPath.first(doc, '/domain/uuid/text()')
    cpus = REXML::XPath.first(doc, '/domain/vcpu/text()')
    memory = REXML::XPath.first(doc, '/domain/memory/text()')

    device = REXML::XPath.first(doc, '/domain/devices/disk/source/@dev').value
    storage_iqn = /\/dev\/disk\/by-path\/.*-iscsi-(.*)-lun-0/.match(device)[1]

    mac_address0 = REXML::XPath.first(doc, '/domain/devices/interface[source/@bridge="br0"]/mac/@address').value
    mac_address1 = REXML::XPath.first(doc, '/domain/devices/interface[source/@bridge="br1"]/mac/@address').value

    return {
      :name => name.to_s,
      :uuid => uuid.to_s,
      :cpus => cpus.to_s.to_i,
      :memory => memory.to_s.to_i / 1024,
      :storage_iqn => storage_iqn.to_s,
      :mac_address0 => mac_address0.to_s,
      :mac_address1 => mac_address1.to_s
    }
  end

end
