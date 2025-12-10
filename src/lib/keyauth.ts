import { Buffer } from "buffer";

interface KeyAuthOptions {
  name: string;
  ownerid: string;
  url?: string;
}

interface KeyAuthUserData {
  username: string;
  ip: string;
  hwid: string;
  expires: number;
  createdate: number;
  lastlogin: number;
  subscription: string;
  subscriptions: string;
}

interface KeyAuthAppData {
  numUsers: number;
  numKeys: number;
  app_ver: string;
  customer_panel: string;
  onlineUsers: number;
}

export default class KeyAuth {
  private name: string;
  private ownerid: string;
  private url: string = "https://keyauth.win/api/1.3/";
  private public_key: string = "5586b4bc69c7a4b487e4563a4cd96afd39140f919bd31cea7d1c6a1e8439422b";
  private loggingEnabled: boolean = true;

  private sessionid?: string;
  private initialized: boolean = false;
  
  public user_data: KeyAuthUserData | null = null;
  public app_data: KeyAuthAppData | null = null;

  constructor(options: KeyAuthOptions) {
    this.name = options.name;
    this.ownerid = options.ownerid;
    this.url = options.url ?? "https://keyauth.win/api/1.3/";

    if (!this.name || !this.ownerid) {
      throw new Error("Name and ownerid are required");
    }
  }

  get_hwid(): string {
    // Browser-compatible HWID generation
    // Use a combination of navigator properties and localStorage
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Browser HWID', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      navigator.platform,
      navigator.hardwareConcurrency,
      screen.width + 'x' + screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    // Create a simple hash from the fingerprint
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Convert to a more readable format
    const hwid = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    
    // Store in localStorage for consistency
    const stored = localStorage.getItem('keyauth_hwid');
    if (!stored) {
      localStorage.setItem('keyauth_hwid', hwid);
      return hwid;
    }
    return stored;
  }

  async init() {
    if (this.sessionid && this.initialized) {
      return { success: true, message: "Application already initialized" };
    }

    let token: string = "";

    const post_data = {
      "type": "init",
      "name": this.name,
      "ownerid": this.ownerid,
    };

    const response = await this.__do_request(post_data) as any;

    if (response === "KeyAuth_Invalid") {
      throw new Error("This application does not exist");
    }

    if (response["success"] === false) {
      throw new Error(response["message"]);
    }

    this.sessionid = response["sessionid"];
    this.initialized = true;
    return { success: true, message: "Application initialized successfully" };
  }

  async register(username: string, password: string, license: string) {
    this.checkinit();
    
    const post_data = {
      "type": "register",
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
      "username": username,
      "pass": password,
      "key": license,
    };

    const response = await this.__do_request(post_data) as any;

    if (response["success"] === true) {
      this.__load_user_data(response["info"]);
      return { success: true, message: response["message"], user_data: this.user_data };
    } else {
      return { success: false, message: response["message"] };
    }
  }

  async upgrade(username: string, license: string) {
    this.checkinit();
    
    const post_data = {
      "type": "upgrade",
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
      "username": username,
      "key": license,
    };

    const response = await this.__do_request(post_data) as any;

    if (response["success"] === true) {
      return { success: true, message: response["message"] + " Restart the application to apply the changes." };
    } else {
      return { success: false, message: response["message"] };
    }
  }

  async login(username: string, password: string, code?: string) {
    this.checkinit();
    
    const post_data = {
      "type": "login",
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
      "username": username,
      "pass": password,

      ...code && { "code": code },
    };

    const response = await this.__do_request(post_data) as any;

    if (response["success"] === true) {
      this.__load_user_data(response["info"]);
      return { success: true, message: response["message"], user_data: this.user_data };
    } else {
      return { success: false, message: response["message"] };
    }
  }

  async license(license: string, code?: string) {
    this.checkinit();
    
    const post_data = {
      "type": "license",
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
      "key": license,

      ...code && { "code": code },
    };

    const response = await this.__do_request(post_data) as any;

    if (response["success"] === true) {
      this.__load_user_data(response["info"]);
      return { success: true, message: response["message"], user_data: this.user_data };
    } else {
      return { success: false, message: response["message"] };
    }
  }

  async var(name: string) {
    this.checkinit();
    
    const post_data = {
      "type": "var",
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
      "varid": name
    };

    const response = await this.__do_request(post_data) as any;

    if (response["success"] === true) {
      return response["message"];
    } else {
      throw new Error(response["message"]);
    }
  }

  async getvar(name: string) {
    this.checkinit();
    
    const post_data = {
      "type": "getvar",
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
      "var": name
    };

    const response = await this.__do_request(post_data) as any;

    if (response["success"] === true) {
      return response["response"];
    } else {
      return null;
    }
  }

  async setvar(name: string, value: string) {
    this.checkinit();
    
    const post_data = {
      "type": "setvar",
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
      "var": name,
      "data": value,
    };

    const response = await this.__do_request(post_data) as any;
    console.log(post_data)
    console.log(response)

    if (response["success"] === true) {
      return true;
    } else {
      throw new Error(response["message"]);
    }
  }

  async ban() {
    this.checkinit();
    
    const post_data = {
      "type": "ban",
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
    };

    const response = await this.__do_request(post_data) as any;

    if (response["success"] === true) {
      return true;
    } else {
      throw new Error(response["message"]);
    }
  }

  async file(id: string) {
    this.checkinit();
    
    const post_data = {
      "type": "file",
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
      "fileid": id
    };

    const response = await this.__do_request(post_data) as any;

    if (response["success"] === true) {
      return Buffer.from(response["contents"], "hex");
    } else {
      throw new Error(response["message"]);
    }
  }

  async webhook(id: string, param: string, body?: string, conttype?: string) {
    this.checkinit();
    
    const post_data = {
      "type": "webhook",
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
      "webid": id,
      "params": param,
      "body": body,
      "conttype": conttype,
    };

    const response = await this.__do_request(post_data) as any;

    if (response["success"] === true) {
      return response["message"];
    } else {
      throw new Error(response["message"]);
    }
  }

  async check() {
    this.checkinit();
    
    const post_data = {
      "type": "check",
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
    };

    const response = await this.__do_request(post_data) as any;

    if (response["success"] === true) {
      return true;
    } else {
      return false;
    }
  }

  async checkblacklist() {
    this.checkinit();
    const hwid = this.get_hwid();
    
    const post_data = {
      "type": "checkblacklist",
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
      "hwid": hwid,
    };

    const response = await this.__do_request(post_data) as any;

    if (response["success"] === true) {
      return true;
    } else {
      return false;
    }
  }

  async log(message: string) {
    this.checkinit();
    
    const post_data = {
      "type": "log",
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
      "message": message,
      "pcuser": "WebUser", // Browser environment doesn't have os.userInfo()
    };

    await this.__do_request(post_data) as any;
  }

  async fetchOnline() {
    this.checkinit();
    
    const post_data = {
      "type": "fetchOnline",
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
    };

    const response = await this.__do_request(post_data) as any;

    if (response["success"] === true) {
      if (Number(response["users"]) === 0) {
        return null;
      } else {
        return Number(response["users"]);
      }
    } else {
      return false;
    }
  }

  async fetchStats() {
    this.checkinit();
    
    const post_data = {
      "type": "fetchStats",
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
    };

    const response = await this.__do_request(post_data) as any;

    if (response["success"] === true) {
      this.__load_app_data(response["appinfo"]);
    }
  }

  async chatGet(channel: string) {
    this.checkinit();
    
    const post_data = {
      "type": "chatget",
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
      "channel": channel,
    };

    const response = await this.__do_request(post_data) as any;

    if (response["success"] === true) {
      return response["messages"];
    } else {
      return false;
    }
  }

  async chatSend(message: string, channel: string) {
    this.checkinit();
    
    const post_data = {
      "type": "chatsend",
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
      "channel": channel,
      "message": message,
    };

    const response = await this.__do_request(post_data) as any;

    if (response["success"] === true) {
      return true;
    } else {
      return false;
    }
  }

  async changeUsername(username: string) {
    this.checkinit();
    
    const post_data = {
      "type": "changeUsername",
      "newUsername": username,
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
    };

    const response = await this.__do_request(post_data) as any;

    if (response["success"] === true) {
      return { success: true, message: "Username changed successfully" };
    } else {
      return { success: false, message: response["message"] || "Failed to change username" };
    }
  }

  async logout() {
    this.checkinit();
    
    const post_data = {
      "type": "logout",
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
    };

    const response = await this.__do_request(post_data) as any;

    if (response["success"] === true) {
      this.sessionid = undefined;
      this.initialized = false;
      this.user_data = null;
      return { success: true, message: "Logged out successfully" };
    } else {
      throw new Error(response["message"]);
    }
  }

  async enable2FA(code?: string) {
    this.checkinit();

    const post_data = {
      "type": "2faenable",
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
      ...code && { "code": code },
    };

    const response = await this.__do_request(post_data) as any;

    if (response["success"] === true) {
      return { 
        success: true, 
        message: response["message"],
        "2fa": response["2fa"] 
      };
    } else {
      return { success: false, message: response["message"] };
    }
  }

  async disable2FA(code: string) {
    this.checkinit();
    
    const post_data = {
      "type": "2fadisable",
      "name": this.name,
      "ownerid": this.ownerid,
      "sessionid": this.sessionid,
      "code": code,
    };

    const response = await this.__do_request(post_data) as any;

    return { success: response["success"], message: response["message"] };
  }

  async checkinit() {
    if (!this.sessionid && !this.initialized) {
      throw new Error("Application not initialized");
    }
  }

  private async __do_request(data: any) {
    try {
      const response = await fetch(this.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        // @ts-ignore - Why does it error? No fucking clue but it works
        body: new URLSearchParams(data).toString(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();
      const dontRunExtra = ["log", "file", "2faenable", "2fadisable"];
      if (dontRunExtra.includes(data.type)) {
        return responseData;
      }

      return responseData;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Unexpected error: ${error}`);
    }
  }

  private redactField(content: string, field: string): string {
    const regex = new RegExp(`"${field}":\\s*".*?"`, "g");
    return content.replace(regex, `"${field}": "[REDACTED]"`);
  }

  private __load_app_data(data: any) {
    this.app_data = {
      numUsers: data["numUsers"],
      numKeys: data["numKeys"],
      app_ver: data["version"],
      customer_panel: data["customerPanelLink"],
      onlineUsers: data["numOnlineUsers"],
    }
  }

  private __load_user_data(data: any) {
    this.user_data = {
      username: data["username"],
      ip: data["ip"],
      hwid: data["hwid"] || "N/A",
      expires: data["subscriptions"][0]["expiry"],
      createdate: data["createdate"],
      lastlogin: data["lastlogin"],
      subscription: data["subscriptions"][0]["subscription"],
      subscriptions: data["subscriptions"],
    }
  }
}