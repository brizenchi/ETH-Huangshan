package result

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Result struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
	TraceID interface{} `json:"trace_id"`
}
type Errno struct {
	Code    int
	Message string
}

const (
	SuccessCode = 200
	SuccessMsg  = "ok"
	FailCode    = -1
)

func Success(c *gin.Context, data interface{}) {
	traceID, _ := c.Get("trace_id")
	c.JSON(http.StatusOK, Result{
		Code:    SuccessCode,
		Message: SuccessMsg,
		Data:    data,
		TraceID: traceID,
	})
}

func UError(c *gin.Context, msg string) {
	traceID, _ := c.Get("trace_id")
	c.JSON(http.StatusOK, Result{
		Code:    FailCode,
		Message: msg,
		Data:    nil,
		TraceID: traceID,
	})
	c.Abort()
}

func Error(c *gin.Context, errno *Errno) {
	traceID, _ := c.Get("trace_id")
	c.JSON(http.StatusOK, Result{
		Code:    errno.Code,
		Message: errno.Message,
		Data:    nil,
		TraceID: traceID,
	})
	c.Abort()
}
