# n8n-nodes-insightshub

This is an n8n community node. It lets you use _app/service name_ in your n8n workflows.

_App/service name_ is _one or two sentences describing the service this node integrates with_.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Usage](#usage)
[Resources](#resources)
[Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

_List the operations supported by your node._

## Credentials

_If users need to authenticate with the app/service, provide details here. You should include prerequisites (such as signing up with the service), available authentication methods, and how to set them up._

## Compatibility

_State the minimum n8n version, as well as which versions you test against. You can also include any known version incompatibility issues._

## Usage

Place **InsightsHub: Report Execution** at the end of the workflow, after the reply has been sent to the user.

- **Timeout:** each request the node makes (reading the execution from the n8n API and sending it to InsightsHub) gives up after 15 seconds by default. Change it in **Options > Timeout (Seconds)**, from 1 to 120. Without a limit, a slow InsightsHub keeps the workflow running until the gateway gives up.
- **Errors:** set the node's **On Error** setting to *Continue* so a failed or timed-out report never marks the workflow execution as failed. The node then outputs `success: false`, the step that failed and the error message.

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* _Link to app/service documentation._

## Version history

_This is another optional section. If your node has multiple versions, include a short description of available versions and what changed, as well as any compatibility impact._
