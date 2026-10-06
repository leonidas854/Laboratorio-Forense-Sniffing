.PHONY: help lab-up lab-down simulate-client simulate-attacker simulate-forensics

help:
	@echo "Laboratorio Forense Automático - Comandos"
	@echo "-----------------------------------------"
	@echo "make lab-up            - Crear VM Rocky Linux, aprovisionar y levantar Podman"
	@echo "make lab-down          - Destruir todo el entorno de forma limpia"
	@echo "make simulate-client   - Ejecutar Playwright para generar tráfico HTTP legítimo"
	@echo "make simulate-attacker - Ejecutar TShark para robar credenciales del tráfico"
	@echo "make simulate-forensics- Ejecutar captura completa de PCAP para análisis"

lab-up:
	@echo "Inicializando Laboratorio..."
	vagrant up
	@echo "Levantando contenedores Podman (PostgreSQL + Next.js)..."
	vagrant ssh -c "cd /vagrant && podman-compose up -d"

lab-down:
	@echo "Destruyendo Laboratorio..."
	vagrant ssh -c "cd /vagrant && podman-compose down" || true
	vagrant destroy -f

simulate-client:
	@echo "Simulando tráfico de un cliente normal..."
	cd playwright-client && npm install && npx playwright test

simulate-attacker:
	@echo "Simulando acciones del atacante (Sniffing pasivo)..."
	vagrant ssh -c "sudo bash /vagrant/scripts/attacker_sniff.sh"

simulate-forensics:
	@echo "Simulando recolección de evidencia del forense..."
	vagrant ssh -c "sudo bash /vagrant/scripts/forensic_capture.sh"
