require "net/ldap/dn"
class LdapAuthentication
  def initialize(login, password)
    @login    = login
    @login_dn = Net::LDAP::DN.new( ::Configuration.ldap_username_attribute, 
                                   login,
                                   ::Configuration.ldap_base )
    @password = password
  end

  def credentials
    # Make sure that we dont allow users to bind with a blank password.
    # https://github.com/ruby-ldap/ruby-net-ldap/issues/5
    user = get_user
    if @password.present? && user
      email = user['mail'].first
      name  = user[::Configuration.ldap_displayname_attribute].first
      Authenticator::Credentials.new(@login, email, name, true)
    end
  end

  private
  def get_user
    session.search(
      base:         ::Configuration.ldap_base,
      filter:       Net::LDAP::Filter.eq( ::Configuration.ldap_username_attribute, @login ),
      attributes:   [ ::Configuration.ldap_displayname_attribute ],
      return_result:true
    ).try(:first)
  end

  def session
    Net::LDAP.new(:host       => ::Configuration.ldap_host,
                  :port       => ::Configuration.ldap_port,
                  :base       => ::Configuration.ldap_base,
                  :auth => { method: :simple, username: @login_dn, password: @password } )
  end
end
