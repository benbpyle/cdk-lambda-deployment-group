package main

import (
	"context"
	"errors"

	"github.com/aws/aws-lambda-go/lambda"
	log "github.com/sirupsen/logrus"
)

func handler(ctx context.Context, event interface{}) error {
	log.SetFormatter(&log.JSONFormatter{})
	log.WithFields(log.Fields{
		"event": event,
	}).Info("Printing out the handler")

	return errors.New("failing on purpose")
}

func main() {
	lambda.Start(handler)
}
