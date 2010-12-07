class Server < ActiveRecord::Base

  belongs_to :image
  has_many :interfaces, :dependent => :destroy, :order => 'interfaces.number'
  has_one :avatar, :dependent => :destroy
  has_many :tags, :dependent => :destroy
  has_many :failover_targets, :dependent => :destroy, :order => 'failover_targets.priority'

  scope :filtered, lambda {|value|
    if value.blank?
      nil
    else
      joins(:tags).where('tags.value' => value)
    end
  }

  validates :name, :presence => true, :uniqueness => true
  validates :uuid, :presence => true
  validates :title, :presence => true
  validates :zone, :presence => true
  validates :physical_server, :presence => true
  validates :pool, :presence => true
  validates :virtualization, :presence => true
  validates :cpus, :inclusion => { :in => 1..Settings.max_cpus }
  validates :memory, :inclusion => { :in => Settings.min_memory..Settings.max_memory }

  before_validation :set_uuid, :set_auto_restart, :set_user_terminate, :set_allow_restart

  def set_uuid
    if self.uuid.blank?
      generator = UUID.new
      begin
        self.uuid = generator.generate
      end until Server.where(:uuid => self.uuid).count == 0
    end
    true
  end

  def set_auto_restart
    self.auto_restart = false if self.auto_restart.nil?
    true
  end

  def set_user_terminate
    self.user_terminate = false if self.user_terminate.nil?
    true
  end

  def set_allow_restart
    self.allow_restart = false if self.allow_restart.nil?
    true
  end

  def errors_for_ext
    hs = errors.collect {|field, error|
      ["server[#{field}]", error]
    }
    interfaces.each do |interface|
      hs += interface.errors.collect {|field, error|
        ["interface[#{interface.number}][#{field}]", error]
      }
    end
    Hash[hs]
  end

  self.include_root_in_json = false
  include Rails.application.routes.url_helpers

  def paths
    avatar = Avatar.select(:id).where(:server_id => self.id).first

    {
      :server => server_path(self),
      :monitor => monitor_server_path(self),
      :tags => tags_server_path(self),
      :failover_targets => failover_targets_server_path(self),
      :suspend => suspend_server_path(self),
      :resume => resume_server_path(self),
      :reboot => reboot_server_path(self),
      :shutdown => shutdown_server_path(self),
      :restart => restart_server_path(self),
      :migrate => migrate_server_path(self),
      :terminate => terminate_server_path(self),
      :avatarThumb => thumb_avatar_path(avatar.id),
      :avatarIcon => icon_avatar_path(avatar.id)
    }
  end

end
