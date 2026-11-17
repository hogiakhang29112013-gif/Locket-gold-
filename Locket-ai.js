"use strict";

const crypto = require("crypto");

const CONFIG = {
    name: "Locket AI Module",
    version: "2.0.0",
    encryption: "aes-256-gcm"
};

class LocketAI {
    constructor(secret) {
        if (!secret || secret.length < 16)
            throw new Error("Invalid secret");

        this.key = crypto.createHash("sha256")
            .update(secret, "utf8").digest();
    }

    encrypt(data) {
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv(
            "aes-256-gcm", this.key, iv
        );

        const encrypted = Buffer.concat([
            cipher.update(JSON.stringify(data), "utf8"),
            cipher.final()
        ]);

        return {
            algorithm: CONFIG.encryption,
            iv: iv.toString("hex"),
            tag: cipher.getAuthTag().toString("hex"),
            data: encrypted.toString("hex")
        };
    }

    decrypt(payload) {
        const decipher = crypto.createDecipheriv(
            "aes-256-gcm",
            this.key,
            Buffer.from(payload.iv, "hex")
        );

        decipher.setAuthTag(Buffer.from(payload.tag, "hex"));

        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(payload.data, "hex")),
            decipher.final()
        ]);

        return JSON.parse(decrypted.toString("utf8"));
    }

    getStatus() {
        return {
            module: CONFIG.name,
            version: CONFIG.version,
            encryption: CONFIG.encryption,
            status: "ACTIVE",
            ai_entitlement: "SERVER_VERIFIED"
        };
    }
}

module.exports = LocketAI;