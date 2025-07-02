package z2mdevice

import (
	"encoding/json"
	"fmt"
)

/*
shared properties:

	type
	friendly_name
	disabled
	ieee_address
	interview_completed
	interviewing
	network_address
	supported

Router properties:

	definition {}
	manufacturer
	model_id
	power_source
	endpoints []
	software_build_id

EndDevice properties

	definition {}
	manufacturer
	model_id
	power_source
	endpoints []
	software_build_id (optional)
*/
type Z2mDevice struct {
	Type               string           `json:"type"`
	FriendlyName       string           `json:"friendly_name"`
	Disabled           bool             `json:"disabled"`
	IeeeAddress        string           `json:"ieee_address"`
	InterviewCompleted bool             `json:"interview_completed"`
	Interviewing       bool             `json:"interviewing"`
	NetworkAddress     int              `json:"network_address"`
	Supported          bool             `json:"supported"`
	Definition         *json.RawMessage `json:"definition"`
}

func ParseDevice(deviceData json.RawMessage) error {
	var rawDevice map[string]interface{}
	var z2mDevice Z2mDevice
	err := json.Unmarshal(deviceData, &rawDevice)
	if err != nil {
		return err
	}
	err = json.Unmarshal(deviceData, &z2mDevice)
	if err != nil {
		return err
	}

	hasDefiniton := z2mDevice.Definition != nil
	fmt.Printf("-- %s\n", rawDevice["type"])
	fmt.Printf("hasDefinition: %v\n", hasDefiniton)

	return nil
}
