
/* raw parse */

const z2m_device_types = [
  'Coordinator',
  'Router',
  'EndDevice',
] as const;

type Z2mDeviceEndpointBinding = {
  cluster: string;
  target: {
    /* only saw one type first-hand _*/
    type: 'endpoint';
    endpoint: number;
    ieee_address: string;
  };
} & {};
type Z2mDeviceEndpointConfiguredReporting = {
  attribute: string;
  cluster: string;
  maximum_reporting_interval: number;
  minimum_reporting_interval: number;
  reportable_change: number | number[];
} & {};

type Z2mDeviceEndpoint = {
  bindings: Z2mDeviceEndpointBinding;
  clusters: {
    input: string[];
    output: string[];
  };
  configured_reportings: Z2mDeviceEndpointConfiguredReporting[];
  scenes: {
    id: number;
    name: string;
  }[];
} & {};

type Z2mDeviceBase = {
  type: typeof z2m_device_types[number];
  friendly_name: string;
  disabled: boolean;
  ieee_address: string;
  interview_completed: boolean;
  interviewing: boolean;
  network_address: number;
  supported: boolean;
  // endpoints
  endpoints: Record<string, Z2mDeviceEndpoint>;
} & {};
