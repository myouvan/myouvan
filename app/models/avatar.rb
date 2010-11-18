class Avatar < ActiveRecord::Base

  before_save :decode_image

  def decode_image
    self.thumb = Base64.decode64(self.thumb)
    self.icon = Base64.decode64(self.icon)
  end

end
