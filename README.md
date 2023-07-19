# Cult of Kafka

This is a spike to a CLI application dedicated to executing operations on an [Apache Kafka](https://kafka.apache.org/) instance. It uses [kafkaJS](https://github.com/tulios/kafkajs) to communicate with Kafka, [Inquirer](https://github.com/SBoudrias/Inquirer.js) as a tool to prompt the user information needed to perform such operations and [dotenv](https://github.com/motdotla/dotenv) to import Environment Variables needed to run the application.

It allows the user to perform several operations, like:
- add, remove or list topics in the Kafka instance;
- send messages included in a JSON file to a topic;
- connect to a topic and read messages received in real-time;

## State of the application

This application is at an early stage: there are no releases planned and development proceed at my own pace. A lot of features are missing and some bugs might be present. Because of this, _Cult of Kafka_ should be used only in personal projects and must be avoided to communicate with Kafka instances in real applications.

In this README file, it is included a guide that explains how to run the application in development mode. It will allow running the application at the state included in the _main_ branch of this repository.

**NOTE**: I can't stress enough that this application is at an early stage and might not work as expected. Please _use it only for personal projects_. I am not responsible for any loss of data, or disservice in configured and deployed Kafka instances. Whoever uses this application is responsible for his actions.

## Contributing

At this very moment, I'm actively seeking contributors or any kind of help, since the time I've to work on it is limited and not linear over time, plus the features I want to implement are not well defined.

This can change at any time, and also you're free to hit me up for any information or doubt you might have.

## How to run the Cult of Kafka

I assume you have basic knowledge of [npm](https://www.npmjs.com/) and [Git](https://git-scm.com/).

So, easily enough, you clone or fork the repository on your machine and access the folder containing the code.
From there, you have to install the needed dependencies inside the _node_modules_ folder:
```
npm ci
```

After that, you want to duplicate the `default.env` file, which contains the environment variables needed to run the application. It has to renamed `.env` (just the extension, no file name) to be automatically recognized by the application
```
> cp default.env .env
```

After that, open your favorite IDE (or Notepad, it's fine, really) and update the file to add values to every environment variable. Here's a list of the needed values:
Name                 | Description                                                                                                               |
---------------------|---------------------------------------------------------------------------------------------------------------------------|
LOG_LEVEL            | the type of logs that will be shown when running the application. It could be _silent_, _fatal_, _error_, _warn_, _info_, _debug_, _trace_. The default is _info_ |
KAFKA_BROKERS_LIST   | list of IPs that includes all the replicas of the Kafka instance you want to connect to. We expect a string, addresses separated by a comma (`,`), no whitespaces |
KAFKA_SASL_MECHANISM | authentication mechanism of Kafka. The only supported ones are _plain_, _scram-sha-256_ and _scram-sha-512_. Authentication is delegated to KafkaJS |
KAFKA_SASL_USERNAME  | username to authenticate (if necessary) |
KAFKA_SASL_PASSWORD  | the password of the user to authenticate (if necessary) |
KAFKA_SSL_ENABLED    | `true` in case an SSL connection is needed to authenticate (if necessary) |
KAFKA_CA_CERT_PATH   | path of the certificate file needed to authenticate (if necessary) |

Once you have updated all of this, you're ready to start. You can launch the application with the following command:
```
npm run start
```

After the application build, the prompt will start and will allow you to execute operations with Kafka.

Also, consider that you can quit the application at any time by pressing `CTRL + C`.