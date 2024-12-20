package com.github.sibdevtools.web.app.kafka.service;

import com.github.sibdevtools.web.app.kafka.exception.UnexpectedErrorException;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;

@Service
public class WebAppKafkaService {

    /**
     * Convert bytes to png image
     *
     * @param width   excepted width of image
     * @param height  excepted height of image
     * @param bytes   bytes to convert
     * @param useGZIP use gzip compression
     * @return resulted image
     */
    public BufferedImage encode(Integer width, Integer height, byte[] bytes, boolean useGZIP) {
        var buffer = useGZIP ? serializeGZIP(bytes) : serialize(bytes);
        var bufferSize = buffer.length;
        var pixels = bufferSize / 3.;

        if (width == null && height == null) {
            var size = (int) Math.ceil(Math.sqrt(pixels));
            width = size;
            height = size;
        } else if (width == null) {
            width = (int) Math.ceil(pixels / height);
        } else if (height == null) {
            height = (int) Math.ceil(pixels / width);
        }

        if (buffer.length > width * height * 3) {
            throw new UnexpectedErrorException("Need to increase image size");
        }

        return createImage(width, height, buffer);
    }

    private static BufferedImage createImage(Integer width, Integer height, byte[] buffer) {
        var image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        var graphics = image.createGraphics();

        int index = 0;
        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                if (index >= buffer.length) break;

                int r = buffer[index++] + 128;
                int g = (index < buffer.length) ? buffer[index++] + 128 : 128;
                int b = (index < buffer.length) ? buffer[index++] + 128 : 128;

                graphics.setColor(new Color(r, g, b));
                graphics.fillRect(x, y, 1, 1);
            }
        }
        graphics.dispose();
        return image;
    }

    private static byte[] serializeGZIP(byte[] bytes) {
        var byteArrayOutputStream = new ByteArrayOutputStream();
        try (var gzipOutputStream = new GZIPOutputStream(byteArrayOutputStream)) {
            gzipOutputStream.write(intToBytes(bytes.length));
            gzipOutputStream.write(bytes);
        } catch (IOException e) {
            throw new UnexpectedErrorException("Can't serialize image", e);
        }
        return byteArrayOutputStream.toByteArray();
    }

    private static byte[] intToBytes(int value) {
        return new byte[]{
                (byte) (value >> 24),
                (byte) (value >> 16),
                (byte) (value >> 8),
                (byte) value
        };
    }

    private static byte[] serialize(byte[] bytes) {
        var buffer = new byte[bytes.length + 4];
        writeIntToBuffer(buffer, bytes.length);
        System.arraycopy(bytes, 0, buffer, 4, bytes.length);
        return buffer;
    }

    private static void writeIntToBuffer(byte[] buffer, int value) {
        buffer[0] = (byte) (value >> 24);
        buffer[1] = (byte) (value >> 16);
        buffer[2] = (byte) (value >> 8);
        buffer[3] = (byte) (value);
    }

    /**
     * Decode PNG image to bytes
     *
     * @param pngBytes PNG bytes
     * @param useGZIP  use gzip decompression
     * @return decoded bytes
     */
    public byte[] decode(byte[] pngBytes, boolean useGZIP) {
        var byteArrayInputStream = new ByteArrayInputStream(pngBytes);
        BufferedImage image;
        try {
            image = ImageIO.read(byteArrayInputStream);
        } catch (IOException e) {
            throw new UnexpectedErrorException("Can't read image", e);
        }
        return toBytes(image, useGZIP);
    }

    private static byte[] toBytes(BufferedImage image, boolean useGZIP) {
        var width = image.getWidth();
        var height = image.getHeight();
        var byteOutputStream = new ByteArrayOutputStream(width * height * 3);
        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                var rgb = image.getRGB(x, y);
                var color = new Color(rgb);
                byteOutputStream.write(color.getRed() - 128);
                byteOutputStream.write(color.getGreen() - 128);
                byteOutputStream.write(color.getBlue() - 128);
            }
        }

        var bytes = byteOutputStream.toByteArray();
        if (useGZIP) {
            bytes = readGZIP(bytes);
        }
        return deserialize(bytes);
    }

    private static byte[] deserialize(byte[] bytes) {
        try {
            var length = Math.min(bytesToInt(bytes), bytes.length - 4);
            var buffer = new byte[length];
            System.arraycopy(bytes, 4, buffer, 0, length);
            return buffer;
        } catch (Exception e) {
            throw new UnexpectedErrorException("Can't deserialize bytes", e);
        }
    }

    private static byte[] readGZIP(byte[] bytes) {
        var byteArrayInputStream = new ByteArrayInputStream(bytes);
        try (var gzipInputStream = new GZIPInputStream(byteArrayInputStream)) {
            return gzipInputStream.readAllBytes();
        } catch (IOException e) {
            throw new UnexpectedErrorException("Can't deserialize bytes", e);
        }
    }

    private static int bytesToInt(byte[] bytes) {
        return ((bytes[0] & 0xFF) << 24) |
                ((bytes[1] & 0xFF) << 16) |
                ((bytes[2] & 0xFF) << 8) |
                (bytes[3] & 0xFF);
    }
}
