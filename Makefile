COMPOSE ?= podman-compose
BASE_URL ?= http://127.0.0.1:8080
PORT ?= 8080
DURATION ?= 40

.PHONY: help lab-up lab-down lab-status lab-logs validate simulate-client simulate-forensics simulate-attacker vm-up vm-halt
help:
	@echo "make lab-up / lab-down       Iniciar / detener sin borrar datos"
	@echo "make lab-status / lab-logs   Estado / logs"
	@echo "make validate               Validar configuración Nginx activa"
	@echo "make simulate-client BASE_URL=http://IP:8080"
	@echo "make simulate-forensics IFACE=enp0s8 SERVER_IP=IP PORT=8080"
	@echo "make simulate-attacker PCAP=evidence/capture-.../traffic.pcapng PORT=8080"
	@echo "make vm-up / vm-halt         Rocky Linux opcional con Vagrant"

lab-up:
	@test -f .env || (echo 'Copia .env.example a .env y ajusta sus valores.'; exit 1)
	$(COMPOSE) up -d --build
	bash scripts/wait_ready.sh "$(BASE_URL)"
lab-down:
	$(COMPOSE) down
lab-status:
	$(COMPOSE) ps
lab-logs:
	$(COMPOSE) logs --tail=100
validate:
	$(COMPOSE) exec -T nginx nginx -t
simulate-client:
	cd playwright-client && BASE_URL="$(BASE_URL)" npm test
simulate-forensics:
	@test -n "$(IFACE)" -a -n "$(SERVER_IP)" || (echo 'Faltan IFACE y SERVER_IP'; exit 1)
	bash scripts/forensic_capture.sh "$(IFACE)" "$(SERVER_IP)" "$(PORT)" "$(DURATION)"
simulate-attacker:
	@test -n "$(PCAP)" || (echo 'Falta PCAP'; exit 1)
	bash scripts/attacker_sniff.sh "$(PCAP)" "$(PORT)"
vm-up:
	vagrant up
vm-halt:
	vagrant halt
