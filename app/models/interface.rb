class Interface < ActiveRecord::Base

  validates :mac_address, :uniqueness => true,
                          :format => { :with => /^[0-9a-z]{2}(:[0-9a-z]{2}){5}$/ }
  validates :ip_address, :uniqueness => true,
                         :format => { :with => /^\d{1,3}(\.\d{1,3}){3}$/ }

  before_validation :set_mac_address

  def set_mac_address
    if self.mac_address.blank?
      begin
        r = Random.new
        l = [0x54, 0x52, 0x00, r.rand(0x00..0x7f), r.rand(0x00..0xff), r.rand(0x00..0xff)]
        self.mac_address = l.collect {|i| '%02x' % i }.join(':')
      end until Interface.where(:mac_address => self.mac_address).count == 0
    end
  end

end
