package logger

import (
	"os"
	"time"

	rotatelogs "github.com/lestrrat-go/file-rotatelogs"
	"github.com/rifflock/lfshook"
	"github.com/sirupsen/logrus"
)

var fileLogger *logrus.Logger

const traceIDKey = "trace_id"

var config Config

type Config struct {
	AppName  string `yaml:"app_name"`
	FilePath string `yaml:"file_path"`
	FileName string `yaml:"file_name"`
	Level    int    `yaml:"level"`
}

func Init(_config Config) error {
	config = _config
	return InitFileLogger(config.FilePath, config.FileName, config.Level)
}

func InitFileLogger(filePath, fileName string, level int) error {

	fileEnd := ".log"
	if !Exists(filePath) {
		os.Mkdir(filePath, os.ModePerm)
	}
	if !Exists(filePath + fileName + fileEnd) {
		f, err := os.Create(filePath + fileName + fileEnd)
		defer f.Close()
		if err != nil {
			return err
		}
	}

	logger := logrus.New()

	//file := path.Join(filePath, fileName+fileEnd)
	//src, hserr := os.OpenFile(file, os.O_APPEND|os.O_WRONLY, os.ModeAppend)
	//if hserr != nil {
	//	return hserr
	//}
	//logger.Out = src

	logger.SetLevel(logrus.Level(level))
	logger.SetFormatter(&logrus.JSONFormatter{
		TimestampFormat: "2006-01-02 15:04:05",
	})
	logWriter, err := rotatelogs.New(
		// 分割后的文件名称
		filePath+fileName+"_%Y-%m-%d.log",
		// 生成软链，指向最新日志文件
		rotatelogs.WithLinkName(filePath+fileName+fileEnd),
		// 设置最大保存时间(30天)
		rotatelogs.WithMaxAge(30*24*time.Hour),
		// 设置日志切割时间间隔(1天)
		rotatelogs.WithRotationTime(time.Hour*24),
		rotatelogs.WithRotationSize(1024*1024*1024*2), // 2G 切割
	)
	if err != nil {
		return err
	}

	writeMap := lfshook.WriterMap{
		logrus.InfoLevel:  logWriter,
		logrus.FatalLevel: logWriter,
		logrus.DebugLevel: logWriter,
		logrus.WarnLevel:  logWriter,
		logrus.ErrorLevel: logWriter,
		logrus.PanicLevel: logWriter,
	}
	lfHook := lfshook.NewHook(writeMap, &logrus.JSONFormatter{
		TimestampFormat: "2006-01-02 15:04:05",
	})
	logger.AddHook(lfHook)
	fileLogger = logger
	return nil
}
func Exists(path string) bool {
	_, err := os.Stat(path) //os.Stat获取文件信息
	return err == nil || os.IsExist(err)
}
