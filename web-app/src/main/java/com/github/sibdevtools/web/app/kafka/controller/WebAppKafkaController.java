package com.github.sibdevtools.web.app.kafka.controller;

import com.github.sibdevtools.common.api.rs.StandardBodyRs;
import com.github.sibdevtools.web.app.kafka.api.DecodeRq;
import com.github.sibdevtools.web.app.kafka.api.EncodeRq;
import com.github.sibdevtools.web.app.kafka.exception.UnexpectedErrorException;
import com.github.sibdevtools.web.app.kafka.service.WebAppKafkaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.imageio.ImageIO;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;

/**
 * @author sibmaks
 * @since 0.0.1
 */
@RestController
@RequestMapping(
        path = "/web/app/kafka/rest/api/",
        produces = MediaType.APPLICATION_JSON_VALUE
)
public class WebAppKafkaController {
    private final WebAppKafkaService service;
    private final Base64.Decoder decoder;
    private final Base64.Encoder encoder;

    @Autowired
    public WebAppKafkaController(
            WebAppKafkaService service,
            @Qualifier("webAppKafkaBase64Decoder")
            Base64.Decoder decoder,
            @Qualifier("webAppKafkaBase64Encoder")
            Base64.Encoder encoder
    ) {
        this.service = service;
        this.decoder = decoder;
        this.encoder = encoder;
    }

    /**
     * Encode base64 into PNG
     *
     * @param rq encode request
     * @return encoded response
     */
    @PostMapping(
            path = "/v1/encode",
            consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public StandardBodyRs<String> encode(@RequestBody EncodeRq rq) {
        var decoded = decoder.decode(
                rq.content()
        );

        var useGzipObject = rq.useGZIP();
        var useGzip = useGzipObject == null || useGzipObject;
        var bufferedImage = service.encode(
                rq.width(),
                rq.height(),
                decoded,
                useGzip
        );

        var byteOutputStream = new ByteArrayOutputStream();
        try {
            ImageIO.write(bufferedImage, "png", byteOutputStream);
        } catch (IOException e) {
            throw new UnexpectedErrorException("Can't write image", e);
        }
        var content = byteOutputStream.toByteArray();
        var rs = encoder.encodeToString(content);
        return new StandardBodyRs<>(rs);
    }


    /**
     * Encode PNG into base64
     *
     * @param rq decode request
     * @return decoded response
     */
    @PostMapping(
            path = "/v1/decode",
            consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public StandardBodyRs<String> decode(@RequestBody DecodeRq rq) {
        var decoded = decoder.decode(
                rq.content()
        );
        var useGzipObject = rq.useGZIP();
        var useGzip = useGzipObject == null || useGzipObject;

        var bytes = service.decode(decoded, useGzip);
        var rs = encoder.encodeToString(bytes);
        return new StandardBodyRs<>(rs);
    }
}
