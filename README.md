# Alexa Video Multimodal Reference Software

This project contains reference software for developing an Alexa video skill on Echo Show. Video skills refer to Alexa skills that can play movies, television, or episodic content. Multimodal is a term for devices with interfaces that offer both voice and screen-based experiences. An example of a multimodal device is an Echo Show.  

The main components of a video skill consist of an AWS Lambda, a web player, and a skill manifest. Similar to other Alexa skills, the Lambda acts as the skill's backend. The web player acts as the skill's front end, and runs on a Echo Show device. It renders video as well as shows UI transport controls such as a play and a pause button. Similar to other Alexa skills, the video skill manifest is a JSON file that describes your skill.

This project contains a sample web player, a sample lambda, and, also, an infrastructure CLI tool.

The CLI tool automates the creation and updating of the video skill with the sample web player and lambda on the cloud. While the sample web player and lambda can be built and managed without the CLI tool, using it is highly recommended for users who want to quickly have a fully functional skill. 

## Quick Start
To get the video skill working on your Echo Show as soon as possible, use the infrastructure CLI tool. To do this follow these steps:

1. Ensure you have all the project requirements:
    * See `Requirements` in [Infrastructure CLI Tool](./infrastructure/README.md) 

2. Install the infrastructure CLI tool.
    * See `Installation` in [Infrastructure CLI Tool](./infrastructure/README.md)
<br>

3. Use the CLI tool to build the skill.  
    * Run the `--init` command using the CLI tool. 
    * Run the `--deploy` command using the CLI tool.
    * Enable your skill on your Echo Show device and test it.
    * See `Usage` in [Infrastructure CLI Tool](./infrastructure/README.md).

## Components

- [Sample Lambda](./lambda/README.md)
- [Sample Web Player](./web-player/README.md)
- [Infrastructure CLI Tool](./infrastructure/README.md)

## Documentation

See the [full technical documentation](https://developer.amazon.com/docs/video-skills-multimodal-devices/sample-video-skill-overview.html).

## License

This library is licensed under the Amazon Software License.

