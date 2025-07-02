/*
see: https://www.zigbee2mqtt.io/guide/usage/exposes.html
_*/
import z from 'zod/v4';

/*
Exposes types from output:
  cat devices.json | jq '[.[].definition.exposes.[]?.type] | unique'
  [
    "enum",
    "light",
    "numeric",
    "switch"
  ]
EndDevice exposes.features types from output:
  cat devices.json | jq '[.[] | .definition.exposes.[]?.features.[]?.type] | unique'
  [
    "binary",
    "composite",
    "numeric"
  ]
_*/
const exposesBinaryValue = z.union([
  z.string(),
  z.boolean(),
]);
const Z2mDeviceExposesBaseZSchema = z.strictObject({
  access: z.number(),
});
const Z2mDeviceExposesGenericBaseZSchema = z.strictObject({
  ...Z2mDeviceExposesBaseZSchema.shape,
  /* common properties across Generic device exposes types _*/
  label: z.string(),
  name: z.string(),
  property: z.string(),
  description: z.string(),
  category: z.string().optional(),
});

/*
GENERIC EXPOSES
_*/
const Z2mDeviceExposesBinaryZSchema = z.strictObject({
  ...Z2mDeviceExposesGenericBaseZSchema.shape,
  /*
    see: https://www.zigbee2mqtt.io/guide/usage/exposes.html#binary
  _*/
  type: z.literal('binary'),
  value_on: exposesBinaryValue,
  value_off: exposesBinaryValue,
  value_toggle: exposesBinaryValue.optional(),
});
const Z2mDeviceExposesNumericZSchema = z.strictObject({
  ...Z2mDeviceExposesGenericBaseZSchema.shape,
  type: z.literal('numeric'),
  value_max: z.number().optional(),
  value_min: z.number().optional(),
  value_step: z.number().optional(),
  unit: z.string().optional(),
  presets: z.array(
    z.strictObject({
      description: z.string(),
      name: z.string(),
      value: z.number(),
    })
  ).optional(),
});
const Z2mDeviceExposesEnumZSchema = z.strictObject({
  ...Z2mDeviceExposesGenericBaseZSchema.shape,
  type: z.literal('enum'),
  values: z.array(z.string()),
});
const Z2mDeviceExposesCompositeZSchema = z.strictObject({
  ...Z2mDeviceExposesBaseZSchema.shape,
  type: z.literal('composite'),
  description: z.string(),
  label: z.string(),
  name: z.string(),
  property: z.string(),
  /* features may contain any non-composite generic exposes types _*/
  features: z.array(z.union([
    Z2mDeviceExposesBinaryZSchema.partial({ description: true }),
    Z2mDeviceExposesNumericZSchema.partial({ description: true }),
    Z2mDeviceExposesEnumZSchema.partial({ description: true }),
  ])).optional(),
});

/*
SPECIFIC EXPOSES
  see: https://www.zigbee2mqtt.io/guide/usage/exposes.html#specific
_*/

const Z2mDeviceExposesLightZSchema = z.strictObject({
  type: z.literal('light'),
  /*
    see: https://www.zigbee2mqtt.io/guide/usage/exposes.html#light
      "possible features are
        state, brightness, color_temp, color_xy, color_hs, min_brightness,
        level_config and color_temp_startup."
    The supported types of features based on this are:
      binary
      numeric
      composite
  _*/
  features: z.array(z.union([
    Z2mDeviceExposesBinaryZSchema,
    Z2mDeviceExposesNumericZSchema,
    Z2mDeviceExposesCompositeZSchema,
  ]))
});
const Z2mDeviceExposesSwitchZSchema = z.strictObject({
  type: z.literal('switch'),
  features: z.array(
    Z2mDeviceExposesBinaryZSchema,
  )
});

export type Z2mDeviceExposesBinaryZType = z.infer<typeof Z2mDeviceExposesBinaryZSchema>;
export const Z2mDeviceExposesBinaryZ = {
  schema: Z2mDeviceExposesBinaryZSchema,
} as const;
export type Z2mDeviceExposesNumericZType = z.infer<typeof Z2mDeviceExposesNumericZSchema>;
export const Z2mDeviceExposesNumericZ = {
  schema: Z2mDeviceExposesNumericZSchema,
} as const;
export type Z2mDeviceExposesEnumZType = z.infer<typeof Z2mDeviceExposesEnumZSchema>;
export const Z2mDeviceExposesEnumZ = {
  schema: Z2mDeviceExposesEnumZSchema,
} as const;
export type Z2mDeviceExposesCompositeZType = z.infer<typeof Z2mDeviceExposesCompositeZSchema>;
export const Z2mDeviceExposesCompositeZ = {
  schema: Z2mDeviceExposesCompositeZSchema,
} as const;

export type Z2mDeviceExposesLightZType = z.infer<typeof Z2mDeviceExposesLightZSchema>;
export const Z2mDeviceExposesLightZ = {
  schema: Z2mDeviceExposesLightZSchema,
} as const;
export type Z2mDeviceExposesSwitchZType = z.infer<typeof Z2mDeviceExposesSwitchZSchema>;
export const Z2mDeviceExposesSwitchZ = {
  schema: Z2mDeviceExposesSwitchZSchema,
} as const;
