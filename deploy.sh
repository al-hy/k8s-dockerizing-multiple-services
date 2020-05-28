#We are going to build the docker images in the travis environment so that we can push the images to docker hub when all the tests passes.
docker build -t ahy94/k8s-dockerizing-multiple-services-react-client:latest -t ahy94/k8s-dockerizing-multiple-services-react-client:$GIT_SHA -f ./react-client/Dockerfile ./react-client
docker build -t ahy94/k8s-dockerizing-multiple-services-express-server:latest -t ahy94/k8s-dockerizing-multiple-services-express-server:$GIT_SHA -f ./express/Dockerfile ./express
docker build -t ahy94/k8s-dockerizing-multiple-services-worker:latest -t ahy94/k8s-dockerizing-multiple-services-worker:$GIT_SHA -f ./worker/Dockerfile ./worker

#Now we are going to push the images we just built to Docker Hub. We are already logged since this script is ran in the Travis environment.

docker push ahy94/k8s-dockerizing-multiple-services-express-server:latest
docker push ahy94/k8s-dockerizing-multiple-services-express-server:$GIT_SHA
docker push ahy94/k8s-dockerizing-multiple-services-react-client:latest
docker push ahy94/k8s-dockerizing-multiple-services-react-client:$GIT_SHA
docker push ahy94/k8s-dockerizing-multiple-services-worker:latest
docker push ahy94/k8s-dockerizing-multiple-services-worker:$GIT_SHA

#Rememebr in the travis environment, we alreayd configure the google cloud to use our account and also got kubectl into the travis environment.
#Once this script runs, kubectl arleady exists in the travis environment
kubectl apply -f ./k8s
kubectl set image deployments/server-deployment server=ahy94/k8s-dockerizing-multiple-services-express-server:$GIT_SHA
kubectl set image deployments/client-deployment client=ahy94/k8s-dockerizing-multiple-services-react-client:$GIT_SHA
kubectl set image deployments/worker-deployment worker=ahy94/k8s-dockerizing-multiple-services-worker:$GIT_SHA
