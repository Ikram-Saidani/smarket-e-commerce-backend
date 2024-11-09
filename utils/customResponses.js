class CustomError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.status = "ERROR";
        this.statusCode = statusCode;
    }

    toJSON() {
        return {
            status: this.status,
            statusCode: this.statusCode,
            message: this.message,
        };
    }
}

class CustomFail extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.status = "FAIL";
        this.statusCode = statusCode;
    }

    toJSON() {
        return {
            status: this.status,
            statusCode: this.statusCode,
            message: this.message,
        };
    }
}

class CustomSuccess {
    constructor(data, statusCode = 200) {
        this.status = "SUCCESS";
        this.statusCode = statusCode;
        this.data = data;
    }

    toJSON() {
        return {
            status: this.status,
            statusCode: this.statusCode,
            data: this.data,
        };
    }
}

module.exports = { CustomError, CustomFail, CustomSuccess };
