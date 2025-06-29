package mqttezd

import (
	"fmt"
	"log"
	"os"

	"github.com/EagleLizard/julius-ezd-2025/src/lib/config"
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
	t := c.Connect()
	t.Wait()
	err = t.Error()
	if err != nil {
		panic(err)
	}
	t = c.Subscribe(devices_topic, 0, devicesTopicHandler)
	t.Wait()
	err = t.Error()
	if err != nil {
		panic(err)
	}
	// fmt.Printf("%+v\n", cfg)
}

func devicesTopicHandler(client mqtt.Client, msg mqtt.Message) {
	fmt.Printf("TOPIC: %s\n", msg.Topic())
	fmt.Printf("MSG: %s\n", msg.Payload())
}
