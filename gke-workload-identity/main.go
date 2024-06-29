package main

import (
	"context"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"cloud.google.com/go/storage"
)

// Port we listen on
const portNum string = ":8080"

// GCS bucket name
const bucketName string = "sample-gcs-bucket"

func getRoot(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("GET /\n")
	io.WriteString(w, "Hello world!\n")
}

func getStorage(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("GET /gcs\n")
	ctx := context.Background()

	// Create client
	client, err := storage.NewClient(ctx)
	if err != nil {
		log.Printf("ERROR: Failed to create client: %v", err)
		io.WriteString(w, "Failed to create client!")
		return
	} else {
		fmt.Println("Client created successfully!")
	}
	defer client.Close()

	// Read the bucket
	bkt := client.Bucket(bucketName)
	attrs, err := bkt.Attrs(ctx)
	if err != nil {
		log.Printf("ERROR: Failed to read bucket: %v", err)
		io.WriteString(w, "Failed to read bucket!")
		return
	} else {
		fmt.Println("Bucket read successfully!")
	}
	resp := fmt.Sprintf("bucket %s, created at %s, is located in %s with storage class %s\n",
		attrs.Name, attrs.Created, attrs.Location, attrs.StorageClass)
	io.WriteString(w, resp)
}

func main() {
	log.Println("Starting our simple http server.")
	http.HandleFunc("/", getRoot)
	http.HandleFunc("/gcs", getStorage)

	log.Println("Started on port", portNum)
	fmt.Println("To close connection CTRL+C :-)")
	err := http.ListenAndServe(portNum, nil)
	if errors.Is(err, http.ErrServerClosed) {
		fmt.Printf("server closed\n")
	} else if err != nil {
		fmt.Printf("error starting server: %s\n", err)
		os.Exit(1)
	}
}
