
import z from 'zod/v4';
import { Z2mDeviceExposesBinaryZ, Z2mDeviceExposesEnumZ, Z2mDeviceExposesLightZ, Z2mDeviceExposesNumericZ, Z2mDeviceExposesSwitchZ } from './z2m-device-exposes-z';

/*
Device types:
  - "Coordinator"
  - "Router"
  - "EndDevice"
_*/

const Z2mDeviceBaseZSchema = z.strictObject({
  type: z.literal([
    'Coordinator',
    'Router',
    'EndDevice',
  ]),
  friendly_name: z.string(),
  disabled: z.boolean(),
  ieee_address: z.string(),
  interview_completed: z.boolean(), // deprecated
  interviewing: z.boolean(), // deprecated
  network_address: z.number(),
  supported: z.boolean(),
  // endpoints
  endpoints: z.record(z.string(), z.object({
    bindings: z.array(z.object({
      cluster: z.string(),
      target: z.object({
        endpoint: z.number(),
        ieee_address: z.string(),
        /* only saw one type first-hand _*/
        type: z.literal('endpoint'),
      }),
    })),
    clusters: z.object({
      input: z.array(z.string()),
      output: z.array(z.string()),
    }),
    configured_reportings: z.array(
      z.object({
        attribute: z.string(),
        cluster: z.string(),
        maximum_report_interval: z.number(),
        minimum_report_interval: z.number(),
        reportable_change: z.union([
          z.number(),
          z.array(z.number()),
        ]),
      }),
    ),
    /*
      I don't have any first-hand data for this, so relying on the examples from the docs
    _*/
    scenes: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
      }),
    ),
  })),
});

const Z2mCoordinatorDeviceZSchema = z.strictObject({
  ...Z2mDeviceBaseZSchema.shape,
  type: z.literal('Coordinator'),
});

/*
  Definition keys from jq command:
    cat devices.json | jq '.[] | select(.type == "EndDevice") | .definition | keys'
  [
    "description",
    "exposes",
    "model",
    "options",
    "supports_ota",
    "vendor"
  ]
_*/

const Z2mRouterDeviceZSchema = z.strictObject({
  ...Z2mDeviceBaseZSchema.shape,
  type: z.literal('Router'),
  // definition
  definition: z.strictObject({
    description: z.string(),
    model: z.string(),
    supports_ota: z.boolean(),
    vendor: z.string(),
    // exposes
    /*
      output from command:
        cat devices.json | jq '[[.[] | select(.type == "Router")] | .[].definition.exposes.[].type] | unique'
      [
        "enum",
        "numeric",
        "switch"
      ]
    _*/
    exposes: z.array(z.union([
      Z2mDeviceExposesEnumZ.schema,
      Z2mDeviceExposesNumericZ.schema,
      Z2mDeviceExposesSwitchZ.schema,
    ])),
    // options
    /*
      output from command:
        cat devices.json | jq '[.[] | select(.type == "Router") | .definition.options.[]?.type] | unique'
      [
        "binary",
        "numeric"
      ]
      Based on looking at the raw json output, the options generally match
        the corresponding exposes schema
    _*/
    options: z.array(z.union([
      Z2mDeviceExposesNumericZ.schema,
      Z2mDeviceExposesBinaryZ.schema,
    ])),
  }),
  manufacturer: z.string(),
  model_id: z.string(),
  power_source: z.string(),
  software_build_id: z.string(),
});

const Z2mEndDeviceZSchema = z.strictObject({
  ...Z2mDeviceBaseZSchema.shape,
  type: z.literal('EndDevice'),
  // definition
  definition: z.strictObject({
    description: z.string(),
    model: z.string(),
    supports_ota: z.boolean(),
    vendor: z.string(),
    // exposes
    /*
      output from command:
        cat devices.json | jq '[[.[] | select(.type == "EndDevice")] | .[].definition.exposes.[].type] | unique'
      [
        "enum",
        "light",
        "numeric"
      ]
    _*/
    exposes: z.array(z.union([
      Z2mDeviceExposesEnumZ.schema,
      Z2mDeviceExposesNumericZ.schema,
      Z2mDeviceExposesLightZ.schema,
    ])),
    // options
    /*
      output from command:
        cat devices.json | jq '[.[] | select(.type == "EndDevice") | .definition.options.[]?.type] | unique'
      [
        "binary",
        "numeric"
      ]
    _*/
    options: z.array(z.union([
      Z2mDeviceExposesNumericZ.schema,
      Z2mDeviceExposesBinaryZ.schema,
    ])),
  }),
  manufacturer: z.string(),
  model_id: z.string(),
  power_source: z.string(),
  software_build_id: z.string().optional(),
  date_code: z.string().optional(),
});

export type Z2mCoordinatorDeviceZType = z.infer<typeof Z2mCoordinatorDeviceZSchema>;
export const Z2mCoordinatorDeviceZ = {
  parse: Z2mCoordinatorDeviceZSchema.parse,
  schema: Z2mCoordinatorDeviceZSchema,
};
export type Z2mRouterDeviceZType = z.infer<typeof Z2mRouterDeviceZSchema>;
export const Z2mRouterDeviceZ = {
  parse: Z2mRouterDeviceZSchema.parse,
  schema: Z2mRouterDeviceZSchema,
};
export type Z2mEndDeviceZType = z.infer<typeof Z2mEndDeviceZSchema>;
export const Z2mEndDeviceZ = {
  parse: Z2mEndDeviceZSchema.parse,
  schema: Z2mEndDeviceZSchema,
};

export type Z2mDeviceZType = (
  Z2mCoordinatorDeviceZType
  | Z2mRouterDeviceZType
  | Z2mEndDeviceZType
);
