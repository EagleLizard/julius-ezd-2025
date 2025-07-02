
import mqtt from'mqtt';
import { juliusConfig } from '../../../config';
import { Z2mCoordinatorDeviceZ, Z2mCoordinatorDeviceZType, Z2mDeviceZType, Z2mEndDeviceZ, Z2mEndDeviceZType, Z2mRouterDeviceZ, Z2mRouterDeviceZType } from '../../models/z2m-device/z2m-device-z';

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
  let packet = await mqttConnect(client);
  console.log('packet:');
  console.log(packet);
  // client.subscribe('#');
  // client.subscribe('zigbee2mqtt/bridge/info');
  client.subscribe(z2m_topics.devices);
  client.on('message', msgRouter);
}

function msgRouter(topic: string, payload: Buffer<ArrayBufferLike>, packet: mqtt.IPublishPacket) {
  console.log(topic);
  switch(topic) {
    case z2m_topics.devices:
      z2mDeviceMsgHandler(payload, packet);
      break;
    default:
      defaultMsgHandler(topic, payload, packet);
  }
}
function z2mDeviceMsgHandler(payload: Buffer<ArrayBufferLike>, packet: mqtt.IPublishPacket) {
  let devices = parseDevicesTopic(payload);
}
function parseDevicesTopic(payload: Buffer<ArrayBufferLike>) {
  let payloadStr: string;
  let payloadObj: unknown | undefined;
  let z2mDevices: Z2mDeviceZType[];
  payloadStr = payload.toString();
  try {
    payloadObj = JSON.parse(payloadStr);
  } catch(e) {
    /*
      TODO: handle json parse failure gracefully
    _*/
    console.log(e);
    throw e;
  }
  if(!Array.isArray(payloadObj)) {
    console.log(payloadObj);
    throw new Error(`Invalid Devices payload: Expected array, received: ${typeof payloadObj}`);
  }
  z2mDevices = [];
  for(let i = 0; i < payloadObj.length; i++) {
    let rawDevice = payloadObj[i];
    let device = parseZ2mDevice(rawDevice);
    z2mDevices.push(device);
  }
  console.log(z2mDevices);
}
function parseZ2mDevice(rawDevice: unknown): Z2mDeviceZType {
  let deviceObj: Record<string, unknown>;
  let z2mDevice: Z2mDeviceZType;
  if((typeof rawDevice) !== 'object') {
    throw new Error(`Invalid Device: expected object, received: ${typeof rawDevice} - ${JSON.stringify(rawDevice)}`);
  }
  deviceObj = rawDevice as Record<string, unknown>;
  switch(deviceObj.type) {
    case 'Coordinator':
      z2mDevice = Z2mCoordinatorDeviceZ.parse(rawDevice);
      break;
    case 'Router':
      z2mDevice = Z2mRouterDeviceZ.parse(rawDevice);
      break;
    case 'EndDevice':
      z2mDevice = Z2mEndDeviceZ.parse(rawDevice);
      break;
    default:
      throw new Error(`Unsupported Device type: ${deviceObj.type}`);
  }
  // console.log(deviceObj.type);
  if(z2mDevice.type === 'Router') {
    console.log(z2mDevice);
  }
  if(z2mDevice.type === 'EndDevice') {
    // console.log(z2mDevice);
    // console.log(deviceObj.definition);
  }
  return z2mDevice;
}

function defaultMsgHandler(
  topic: string,
  payload: Buffer<ArrayBufferLike>,
  packet: mqtt.IPublishPacket
) {
  let payloadStr: string;
  payloadStr = payload.toString();
  console.log(payloadStr);
}

function mqttConnect(client: mqtt.MqttClient): Promise<mqtt.IConnackPacket> {
  let p: Promise<mqtt.IConnackPacket>;
  p = new Promise((resolve, reject) => {
    client.once('error', (err) => {
      reject(err);
    });
    client.once('connect', (packet) => {
      resolve(packet);
    });
  });
  return p;
}
