package main

import (
	"fmt"
	"os"

	"github.com/EagleLizard/julius-ezd-2025/src/lib/cmd/mqttezd"
)

func main() {
	fmt.Printf("[go] julius-ezd-2025 ~\n")
	args := os.Args
	for _, arg := range args {
		fmt.Printf("%s, ", arg)
	}
	fmt.Print("\n")
	jArgs := parseArgs(os.Args)
	fmt.Printf("jArgs: %+v\n", jArgs)
	switch jArgs.Cmd {
	case "mqtt":
		mqttezd.MqttMain()
	default:
		fmt.Printf("No command - it would be nice to have a list of valid ones here\n")
	}
}

type JuliusArgs struct {
	Cmd string
}

/* simple for now, check the command part */
func parseArgs(_args []string) JuliusArgs {
	args := _args[1:] // first arg is bin path
	fmt.Printf("args: %q\n", args)
	jArgs := JuliusArgs{}
	var firstArg string
	if len(args) > 0 {
		firstArg = args[0]
	}
	jArgs.Cmd = firstArg
	return jArgs
}
