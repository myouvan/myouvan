class AvatarsController < ApplicationController

  def thumb
    avatar = Avatar.select(:thumb).find(params[:id])
    send_data avatar.thumb, :type => 'image/png'
  end

  def icon
    avatar = Avatar.select(:icon).find(params[:id])
    send_data avatar.icon, :type => 'image/png'
  end

end
