import 'dotenv/config';

const mqtt_required_keys = [
  'mqtt_server',
  'mqtt_user',
  'mqtt_password',
] as const;
type MqttConfigKey = typeof mqtt_required_keys[number];
type MqttConfig = Record<MqttConfigKey, string> & {

};

export const juliusConfig = {
  getMqttCfg,
} as const;
function getMqttCfg(): MqttConfig {
  let cfg: Partial<MqttConfig>;
  cfg = {};
  for(let i = 0; i < mqtt_required_keys.length; ++i) {
    let currKey = mqtt_required_keys[i];
    if(process.env[currKey] === undefined) {
      throw new Error(`MQTT - Missing required key: ${currKey}`);
    }
    cfg[currKey] = process.env[currKey];
  }
  return cfg as MqttConfig;
}
