/****************************************************************************
Copyright (c) 2012-2013 cocos2d-x.org

http://www.cocos2d-x.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
****************************************************************************/
#include "ProtocolPush.h"
#include "PluginJniHelper.h"
#include <android/log.h>
#include "PluginUtils.h"
#include "PluginJavaData.h"

namespace cocos2d { namespace plugin {

ProtocolPush::ProtocolPush()
{
}

ProtocolPush::~ProtocolPush()
{
}


void ProtocolPush::configGameInfo(TSessionGameInfo gameInfo)
{
	if (gameInfo.empty())
	{
		PluginUtils::outputLog("ProtocolPush", "The game info is empty!");
		return;
	}
    else
    {
        PluginUtils::outputLog("ProtocolPush", "configGameInfo invoke!!!!!!!!!!");

        PluginJavaData* pData = PluginUtils::getPluginJavaData(this);
		PluginJniMethodInfo t;
		if (PluginJniHelper::getMethodInfo(t
			, pData->jclassName.c_str()
			, "configGameInfo"
			, "(Ljava/util/Hashtable;)V"))
		{
			// generate the hashtable from map
			PluginUtils::outputLog("ProtocolPush", "configGameInfo invoke");
			jobject obj_Map = PluginUtils::createJavaMapObject(&gameInfo);

			// invoke java method
			t.env->CallVoidMethod(pData->jobj, t.methodID, obj_Map);
			t.env->DeleteLocalRef(obj_Map);
			t.env->DeleteLocalRef(t.classID);
		}
    }
}

void ProtocolPush::configDeveloperInfo(TPushDeveloperInfo devInfo)
{
    if (devInfo.empty())
    {
        PluginUtils::outputLog("ProtocolPush", "The developer info is empty!");
        return;
    }
    else
    {
        PluginJavaData* pData = PluginUtils::getPluginJavaData(this);
    	PluginJniMethodInfo t;
        if (PluginJniHelper::getMethodInfo(t
    		, pData->jclassName.c_str()
    		, "configDeveloperInfo"
    		, "(Ljava/util/Hashtable;)V"))
    	{
        	PluginUtils::outputLog("ProtocolPush", "ProtocolPush::configDeveloperInfo");
        	// generate the hashtable from map
        	jobject obj_Map = PluginUtils::createJavaMapObject(&devInfo);

            // invoke java method
            t.env->CallVoidMethod(pData->jobj, t.methodID, obj_Map);
            t.env->DeleteLocalRef(obj_Map);
            t.env->DeleteLocalRef(t.classID);
        }
    }
}

void ProtocolPush::StartPushSDK()
{
	PluginJavaData* pData = PluginUtils::getPluginJavaData(this);
	PluginJniMethodInfo t;
	if (PluginJniHelper::getMethodInfo(t
		, pData->jclassName.c_str()
		, "StartPushSDK"
		, "()V"))
	{
		PluginUtils::outputLog("ProtocolPush", "ProtocolPush::StartPushSDK");
		// invoke java method
		t.env->CallVoidMethod(pData->jobj, t.methodID);
		t.env->DeleteLocalRef(t.classID);
	}
}

void ProtocolPush::StartPushSDKItem(TPushDeveloperInfo devInfo)
{
	if (devInfo.empty())
	{
		PluginUtils::outputLog("ProtocolPush", "The StartPushSDKItem info is empty!");
		return;
	}
	else
	{
		PluginJavaData* pData = PluginUtils::getPluginJavaData(this);
		PluginJniMethodInfo t;
		if (PluginJniHelper::getMethodInfo(t
			, pData->jclassName.c_str()
			, "StartPushSDKItem"
			, "(Ljava/util/Hashtable;)V"))
		{
			PluginUtils::outputLog("ProtocolPush", "ProtocolPush::StartPushSDKItem");
			jobject obj_Map = PluginUtils::createJavaMapObject(&devInfo);
			// invoke java method
			t.env->CallVoidMethod(pData->jobj, t.methodID, obj_Map);
			t.env->DeleteLocalRef(obj_Map);
			t.env->DeleteLocalRef(t.classID);
		}
	}
}

void ProtocolPush::pushToUser(TPushDeveloperInfo devInfo)
{
	if (devInfo.empty())
	{
		PluginUtils::outputLog("ProtocolPush", "The developer info is empty!");
		return;
	}
	else
	{
		PluginJavaData* pData = PluginUtils::getPluginJavaData(this);
		PluginJniMethodInfo t;
		if (PluginJniHelper::getMethodInfo(t
			, pData->jclassName.c_str()
			, "pushToUser"
			, "(Ljava/util/Hashtable;)V"))
		{
			PluginUtils::outputLog("ProtocolPush", "ProtocolPush::pushToUser");
			// generate the hashtable from map
			jobject obj_Map = PluginUtils::createJavaMapObject(&devInfo);

			// invoke java method
			t.env->CallVoidMethod(pData->jobj, t.methodID, obj_Map);
			t.env->DeleteLocalRef(obj_Map);
			t.env->DeleteLocalRef(t.classID);
		}
	}
}

}} // namespace cocos2d { namespace plugin {
