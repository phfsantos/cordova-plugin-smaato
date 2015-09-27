/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */

#include <sys/types.h>
#include <sys/sysctl.h>
#import <Cordova/CDV.h>
#import <AdSupport/AdSupport.h>
#import "CDVSmaato.h"

@implementation CDVSmaato

- (void)getAdInfo:(CDVInvokedUrlCommand*)command
{
    NSDictionary* adProperties = [self adProperties];
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:adProperties];

    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (NSDictionary*)adProperties
{
    NSMutableDictionary* devProps = [NSMutableDictionary dictionaryWithCapacity:2];

    [devProps setObject:[[[ASIdentifierManager sharedManager] advertisingIdentifier] UUIDString] forKey:@"iosadid"];
    [devProps setObject:[NSNumber numberWithBool:[[ASIdentifierManager sharedManager] isAdvertisingTrackingEnabled]] forKey:@"iosadtracking"];

    NSDictionary* devReturn = [NSDictionary dictionaryWithDictionary:devProps];
    return devReturn;
}

@end
