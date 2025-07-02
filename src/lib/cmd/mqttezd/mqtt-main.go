package mqttezd

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/EagleLizard/julius-ezd-2025/src/lib/config"
	z2mdevice "github.com/EagleLizard/julius-ezd-2025/src/lib/models/z2m-device"
	mqtt "github.com/eclipse/paho.mqtt.golang"
)

const z2m_prefix = "zigbee2mqtt"
const info_topic = z2m_prefix + "/bridge/info"
const devices_topic = z2m_prefix + "/bridge/devices"

func MqttMain() {
	fmt.Printf("mqtt main()\n")
	cfg, err := config.GetMqttConfig()
	if err != nil {
		panic(err)
	}
	mqtt.ERROR = log.New(os.Stdout, "[ERROR] ", 0)
	mqtt.CRITICAL = log.New(os.Stdout, "[CRIT] ", 0)
	mqtt.WARN = log.New(os.Stdout, "[WARN] ", 0)
	mqtt.DEBUG = log.New(os.Stdout, "[DEBUG] ", 0)
	opts := mqtt.NewClientOptions()
	opts.AddBroker(cfg.Server)
	opts.SetClientID("julius-ezd-2025")
	opts.SetUsername(cfg.User)
	opts.SetPassword(cfg.Password)
	c := mqtt.NewClient(opts)
	if t := c.Connect(); t.Wait() && t.Error() != nil {
		panic(t.Error())
	}
	msgCh := make(chan [2]string)
	fn := func(client mqtt.Client, msg mqtt.Message) {
		msgCh <- [2]string{msg.Topic(), string(msg.Payload())}
	}
	if t := c.Subscribe(devices_topic, 0, fn); t.Wait() && t.Error() != nil {
		panic(t.Error())
	}
	receiveCount := 0
	dcCh := make(chan struct{})
	go func() {
		time.Sleep(2 * time.Second)
		dcCh <- struct{}{}
	}()
topic_loop:
	for {
		select {
		case msg := <-msgCh:
			receiveCount++
			msgRouter(msg[0], msg[1])
			fmt.Printf("count: %d\n", receiveCount)
		case <-dcCh:
			break topic_loop
		}
	}
	// fmt.Printf("%+v\n", cfg)
}
func msgRouter(topic string, payload string) {
	switch topic {
	case devices_topic:
		devicesMsgHandler(payload)
	default:
		defaultMsgHandler(topic, payload)
	}
}

func defaultMsgHandler(topic string, payload string) {
	fmt.Printf("topic: %s, payload: %s\n", payload[0], payload[1])
}

func devicesMsgHandler(msg string) {
	fmt.Printf("devices ~ %d\n", len(msg))
	err := parseDevices(msg)
	if err != nil {
		panic(err)
	}
}

type Z2mDevicePayload struct {
}

/*
taking this approach https://stackoverflow.com/a/30574518/4677252
_
*/
func parseDevices(rawDevices string) error {
	rawDeviceArr := []json.RawMessage{}
	err := json.Unmarshal([]byte(rawDevices), &rawDeviceArr)
	if err != nil {
		return err
	}
	for _, deviceData := range rawDeviceArr {
		err = z2mdevice.ParseDevice(deviceData)
		if err != nil {
			return err
		}
	}
	return nil
}
