
# Julius EZD 2025

Coding scratchpad for the month of July 2025. Named after [Julius Caesar](https://en.wikipedia.org/wiki/Julius_Caesar).

## MQTT

I'm writing an MQTT, currently for subscribing to / interacting with Zigbee2MQTT.

References:

1. https://www.zigbee2mqtt.io/guide/usage/mqtt_topics_and_messages.html

## Storing state - SQLite

I don't want to store state in json files nor do I want to roll a whole postgreSQL container so I'm going to roll sqlite.

## Typescript [TS]

### `zod` vs. `@sinclair/typebox`

Schema validation... Not the most exciting topic.

Previously I've reached for typebox for the espoused performance benefits and json-schema-first approach; however, zod has attained greater adoption from what I have seen. Based on the `zod/v4` [release article](https://zod.dev/v4), it looks like performance may not be as big of a concern as I thought.

Because of this, I plan on implementing both and (potentially) testing performance myself for my case.

Because I'm more recently familiar with typebox, I'll start with zod.
