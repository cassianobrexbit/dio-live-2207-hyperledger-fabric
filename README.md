# dio-live-2207-hyperledger-fabric
Repositório para a live sobre Hyperledger Fabric

## Passos para desenvolvimento do projeto
### Pré-requisitos
- Ambiente Ubuntu 20.04
- Instalar Docker: https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-20-04
- Instalar Docker Compose: https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-compose-on-ubuntu-20-04
- Instalar Go: https://www.digitalocean.com/community/tutorials/how-to-install-go-on-ubuntu-18-04
- Instalar NodeJS: https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-20-04
### Desenvolvimento

#### Terminal 1
- Clonar repositório e instalar dependências: ```curl -sSL https://bit.ly/2ysbOFE | bash -s```
- ```ls```
- ```cd fabric-samples/test-network```
- Confirmar que não há redes em execução no Hyperledger: ```./network.sh down```
- Criar nova rede com um novo canal: ```./network.sh up createChannel -c mychannel -ca```
- Publicar chaincode no canal:```./network.sh deployCC -ccn basic -ccp ../asset-transfer-basic/chaincode-javascript/ -ccl javascript```
#### Terminal 2
- Acessar aplicação que irá interagir com o chaincode: ```cd asset-transfer-basic/application-javascript```
- Instalar dependências: ```npm instal```
- ```ls```
- Iniciar aplicação: ```node app.js```
