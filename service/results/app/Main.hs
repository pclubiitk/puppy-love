module Main where

import Lib (mongoRun)

import System.Environment (lookupEnv)
import Data.Maybe (fromMaybe)

main :: IO ()
main = do
  mongoHost <- lookupEnv "MONGO_PORT_27017_TCP_ADDR"
  mongoPort <- lookupEnv "MONGO_PORT_27017_TCP_PORT"
  mongoRun $ (fromMaybe "0.0.0.0" mongoHost) ++ ":" ++
    (fromMaybe "27017" mongoPort)
