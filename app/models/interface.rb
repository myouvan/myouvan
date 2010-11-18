class Interface < ActiveRecord::Base

  validates :mac_address, :uniqueness => true,
                          :format => { :with => /^[0-9a-z]{2}(:[0-9a-z]{2}){5}$/ }
  validates :ip_address, :uniqueness => true,
                         :format => { :with => /^\d{1,3}(\.\d{1,3}){3}$/ }

end
