package logger

import (
	"log"
	"os"
)

type Logger interface {
	Info(msg string)
	Error(msg string)
	Debug(msg string)
	Warn(msg string)
}

type logger struct {
	infoLogger  *log.Logger
	errorLogger *log.Logger
	debugLogger *log.Logger
	warnLogger  *log.Logger
	level       string
}

func New(level string) Logger {
	return &logger{
		infoLogger:  log.New(os.Stdout, "INFO: ", log.Ldate|log.Ltime|log.Lshortfile),
		errorLogger: log.New(os.Stderr, "ERROR: ", log.Ldate|log.Ltime|log.Lshortfile),
		debugLogger: log.New(os.Stdout, "DEBUG: ", log.Ldate|log.Ltime|log.Lshortfile),
		warnLogger:  log.New(os.Stdout, "WARN: ", log.Ldate|log.Ltime|log.Lshortfile),
		level:       level,
	}
}

func (l *logger) Info(msg string) {
	l.infoLogger.Println(msg)
}

func (l *logger) Error(msg string) {
	l.errorLogger.Println(msg)
}

func (l *logger) Debug(msg string) {
	if l.level == "debug" {
		l.debugLogger.Println(msg)
	}
}

func (l *logger) Warn(msg string) {
	l.warnLogger.Println(msg)
}