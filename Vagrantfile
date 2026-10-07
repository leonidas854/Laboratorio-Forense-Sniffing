# Alternativa opcional: la ruta principal es un servidor Rocky ya instalado.
Vagrant.configure("2") do |config|
  config.vm.box = "generic/rocky9"
  config.vm.network "forwarded_port", guest: 8080, host: 8080, host_ip: "127.0.0.1", id: "http"
  # HTTPS FUTURO: habilitar junto con Compose y Nginx.
  # config.vm.network "forwarded_port", guest: 8443, host: 8443, host_ip: "127.0.0.1", id: "https"
  config.vm.network "private_network", ip: "192.168.56.10"
  config.vm.provider "virtualbox" do |vb|
    vb.memory = "4096"
    vb.cpus = 2
  end
  config.vm.provision "shell", inline: <<-SHELL
    set -eu
    dnf install -y epel-release
    dnf install -y podman podman-compose git make curl openssl python3 wireshark-cli tcpdump rsync
    # Copiar fuera de /vagrant: algunos shared folders no soportan etiquetas SELinux.
    install -d -o vagrant -g vagrant /home/vagrant/laboratorio
    rsync -a --exclude=node_modules --exclude=.next --exclude=.env --exclude=.git --exclude=.vagrant --exclude=evidence /vagrant/ /home/vagrant/laboratorio/
    chown -R vagrant:vagrant /home/vagrant/laboratorio
    echo "Listo. En /home/vagrant/laboratorio copia .env.example a .env."
    echo "Para esta VM usa LAB_BIND_IP=0.0.0.0 y ejecuta make lab-up como vagrant."
    echo "Revisa doscs/02-rocky-linux.md para firewalld; SELinux sigue activo."
  SHELL
end
