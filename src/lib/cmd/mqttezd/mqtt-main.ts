
import mqtt from'mqtt';
import { juliusConfig } from '../../../config';

const z2m_prefix = 'zigbee2mqtt';
const z2m_topics = {
  info: `${z2m_prefix}/bridge/info`,
  devices: `${z2m_prefix}/bridge/devices`,
} as const;

export async function mqttMain() {
  const mqttCfg = juliusConfig.getMqttCfg();
  console.log('mqttMain');
  console.log(mqttCfg);
  const client = mqtt.connect(mqttCfg.mqtt_server, {
    username: mqttCfg.mqtt_user,
    password: mqttCfg.mqtt_password,
  });
  // client.subscribe('#');
  // client.subscribe('zigbee2mqtt/bridge/info');
  client.subscribe('zigbee2mqtt/bridge/devices');
  client.on('connect', (packet) => {
    console.log('connect');
    console.log('packet');
    console.log(packet);
  });
  client.on('message', (topic, payload, packet) => {
    let payloadStr: string;
    let payloadObj: unknown | undefined;
    console.log('\n');
    console.log(topic);
    payloadStr = payload.toString();
    try {
      payloadObj = JSON.parse(payloadStr);
    } catch(e) {
      console.log(e);
    }
    if(payloadObj !== undefined) {
      console.log(payloadObj);
    } else {
      console.log(payloadStr);
    }
  });
}
