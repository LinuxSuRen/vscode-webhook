Watch the listen ports, then send the payload to the specific webhook server.

The webhook server should be a POST http server. Below is an example of the payload:

```json
{
    "ports": [ 8080 ]
}
```

## Limitation

* `netstat` command is required
