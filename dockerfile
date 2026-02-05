FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV PATH=$PATH:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin
ENV PATH=$PATH:$ANDROID_SDK_ROOT/platform-tools
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

# System deps
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    wget \
    unzip \
    git \
    curl \
    nodejs \
    npm \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Android SDK
RUN mkdir -p $ANDROID_SDK_ROOT/cmdline-tools && \
    cd /opt && \
    wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O tools.zip && \
    unzip tools.zip && \
    mv cmdline-tools $ANDROID_SDK_ROOT/cmdline-tools/latest && \
    rm tools.zip

# SDK packages
RUN yes | sdkmanager --licenses && \
    sdkmanager \
      "platform-tools" \
      "platforms;android-34" \
      "build-tools;34.0.0"

# Expo
RUN npm install -g expo-cli

WORKDIR /app
