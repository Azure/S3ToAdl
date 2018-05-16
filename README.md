# S3 to Azure Data Lake Store incremental data copy
This tool is designed to copy data from AWS S3 to Azure Data Lake Store Incrementaly.<br/>
For initial data copy [Azure Data Factory](https://docs.microsoft.com/en-us/azure/data-factory/data-factory-introduction) is recommended.<br/>
The tool will detect which files exist in S3 and are missing from ADL. <br/> 
It will download them from S3 to a local folder and then upload them to Azure Data Lake.<br/><br/>
When running the tool often, it is recommended to add integration with Redis for persistency.<br/>
The redis will hold the metadata of the files that were copied from S3 to ADL.

In order to run the tool the following environment variables needs to be defined:

* AWS configuration: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_BUCKET_NAME
* Azure Configuration: AZURE_CLIENT_ID, AZURE_DOMAIN, AZURE_SECRET, AZURE_ADL_ACCOUNT_NAME
* Local folder for temporary download the files: TEMP_FOLDER
* Optional Parameters for running with Redis: USE_REDIS - should be set to "true" to integrate with Redis. </br>
REDIS_PORT - default is 6379, REDIS_HOST- default is "redis".

### Prerequisites

To use this tool, first you need to have an Azure Service Principal configured in the Azure Data Lake Store.

1. Create an Azure Service Principal through [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/create-an-azure-service-principal-azure-cli?toc=%2fazure%2fazure-resource-manager%2ftoc.json) or [Azure portal](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-create-service-principal-portal).
2. Open your Azure data lake store from [Azure Portal](https://portal.azure.com). Open Data Explorer and click on 'Access'.<br/>
Click on 'Add' and select the service principal you've just created.

## Run With Docker
1. If running with Redis, run: 
```
docker run --name *redisName* -d -v /dir:/data  redis --appendonly yes 
```
2. `docker build -t **image name** .`
3. To run the docker file update the environment variables in the docker file, and then run:
```
`docker run -v '/dir:/tempdir' -p 80:4200 **image name**`
```
   or add the environment variables as part of the docker run command:<br/>

```
docker run -v '/dir:/tempdir' -e AWS_ACCESS_KEY_ID='access_Key_Id' -e AWS_SECRET_ACCESS_KEY='secret_access_key' -e AWS_REGION='region' -e AWS_BUCKET_NAME='bucket_name' -e AZURE_CLIENT_ID='azure_cliet_id' -e AZURE_DOMAIN='Azure_domain' -e AZURE_SECRET='azure_secret' -e AZURE_ADL_ACCOUNT_NAME='adl_accountName' -e TEMP_FOLDER='/tempdir' -p 80:4200 **image name**
```
If running with Redis add : `--link *redisName*:redis` to the run command.</br>
Go to http://[host-ip]/ to check out the copy status and progress.</br>
The -v flag mounts the current working directory into the container. [Documentation](https://docs.docker.com/engine/reference/commandline/run/#mount-volume--v-read-only)<br/>
4. Docker image is also available at Docker Hub - `docker pull catalystcode/s3toadl`<br/>
At the end of the run log file will be written to TEMP_FOLDER.

## Run Locally
In order to run the tool locally node should be installed.
1. Define the required environment variables.
2. run the following:
```
git clone https://github.com/CatalystCode/s3toadl.git
npm install
node lib/index.js
```
3. Go to http://localhost:4200/ to check out the copy status and progress
At the end of the run log file will be written to TEMP_FOLDER.

**Run Tests**<br/>
```
npm test
```

**Run E2E** <br/>
For sanity check, you can run an E2E test, which will upload one file to S3,
run the tool, and will validate that the file was uploaded to Azure Data Lake.<br/>
It is recommend to run this test on an empty S3 bucket - otherwise the test will upload <b>ALL</b> the files in the bucket to the data lake.
```
node lib/test/e2eTest.js
```

# Licence
MIT
