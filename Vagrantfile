Vagrant.configure("2") do |config|
  # Cambiado a Rocky Linux 9
  config.vm.box = "generic/rocky9"
  config.vm.network "forwarded_port", guest: 80, host: 8080, id: "nginx"
  
  # Asignar una IP estática local para facilidad
  config.vm.network "private_network", ip: "192.168.56.10"

  config.vm.provider "virtualbox" do |vb|
    vb.memory = "2048"
    vb.cpus = 2
  end

  config.vm.provision "shell", inline: <<-SHELL
    # Desactivar SELinux temporalmente para permitir proxy inverso sin configuraciones complejas en el laboratorio
    setenforce 0
    sed -i 's/SELINUX=enforcing/SELINUX=permissive/' /etc/selinux/config
    
    echo "Actualizando paquetes y añadiendo repositorios..."
    dnf update -y
    dnf install -y epel-release
    
    echo "Instalando Nginx, Podman, Wireshark (tshark), tcpdump y utilidades..."
    dnf install -y nginx podman tcpdump wireshark-cli curl jq python3-pip
    
    echo "Instalando podman-compose..."
    pip3 install podman-compose
    
    echo "Instalando ZeroTier..."
    curl -s https://install.zerotier.com | sudo bash
    
    # Cargar variables de entorno si existe el archivo
    if [ -f /vagrant/.env ]; then
      export $(grep -v '^#' /vagrant/.env | xargs)
      if [ ! -z "$ZEROTIER_NETWORK_ID" ] && [ "$ZEROTIER_NETWORK_ID" != "YOUR_NETWORK_ID_HERE" ]; then
        echo "Uniéndose a la red ZeroTier: $ZEROTIER_NETWORK_ID"
        zerotier-cli join $ZEROTIER_NETWORK_ID
      else
        echo "No se unió a ZeroTier. Configura ZEROTIER_NETWORK_ID en .env y ejecuta 'zerotier-cli join' manualmente."
      fi
    fi

    echo "Configurando Nginx para reverse proxy en puerto 80..."
    cat << 'EOF' > /etc/nginx/conf.d/webapp.conf
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
    
    # Iniciar y habilitar Nginx
    systemctl enable nginx
    systemctl restart nginx

    echo "Aprovisionamiento de Rocky Linux completado."
  SHELL
end
