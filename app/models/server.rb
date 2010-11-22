class Server < ActiveRecord::Base

  belongs_to :image
  has_many :interfaces, :dependent => :destroy
  has_one :avatar, :dependent => :destroy
  has_many :tags, :dependent => :destroy

  validates :name, :presence => true, :uniqueness => true
  validates :uuid, :presence => true
  validates :title, :presence => true
  validates :zone, :presence => true
  validates :physical_server, :presence => true
  validates :pool, :presence => true
  validates :virtualization, :presence => true
  validates :cpus, :inclusion => { :in => 1..Settings.max_cpus }
  validates :memory, :inclusion => { :in => Settings.min_memory..Settings.max_memory }

  before_validation :set_uuid, :set_auto_restart, :set_user_terminate

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

end
