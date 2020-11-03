# Serverless REST API

This document demonstrates how to setup a [RESTful Web Services](https://en.wikipedia.org/wiki/Representational_state_transfer#Applied_to_web_services) allowing you to create, list, get, update and delete items. DynamoDB is used to store the data.

## Structure

This service has a separate directory for all the component operations. For each operation exactly one file exists e.g. `performAction/create.js`. In each of these files there is exactly one function which is directly attached to `module.exports`.

## Setup

```bash
npm install
```

## Deploy

In order to deploy the endpoint - go to specific component(for instance we you want to deploy groups, cd into groups and run the below command)

sls deploy --stage cis


The expected result should be similar to:

```bash
Serverless: Packaging service…
Serverless: Uploading CloudFormation file to S3…
Serverless: Uploading service .zip file to S3…
Serverless: Updating Stack…
Serverless: Checking Stack update progress…
Serverless: Stack update finished…

Service Information
service: cis-backend
stage: dev
region: us-east-1
api keys:
  None
endpoints:
  POST - 
  GET - 
  GET - 
  PUT - 
  DELETE - 
functions:
 
